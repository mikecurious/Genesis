const User = require('../models/User');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const agentNotificationService = require('./agentNotificationService');
const gmailService = require('./gmailService');

/**
 * Email Inquiry Service
 * Handles inbound email tracking via SendGrid webhook
 */
class EmailInquiryService {
    /**
     * Handle inbound email webhook from SendGrid
     * @param {Object} emailData - Parsed email data from SendGrid
     */
    async handleInboundEmail(emailData) {
        try {
            console.log('Processing inbound email:', emailData.from);

            // Extract email components
            const senderEmail = this.extractEmail(emailData.from);
            const subject = emailData.subject || '';
            const body = emailData.text || emailData.html || '';

            // Find property reference in email
            const property = await this.findPropertyFromEmail(subject, body);
            if (!property) {
                console.log('No property reference found in email');
                return { success: false, error: 'No property reference found' };
            }

            // Find agent (property owner)
            const agent = await User.findById(property.createdBy);
            if (!agent) {
                console.log('Agent not found for property:', property._id);
                return { success: false, error: 'Agent not found' };
            }

            // Check if lead already exists
            let lead = await Lead.findOne({
                'client.email': senderEmail,
                property: property._id
            });

            if (lead) {
                // Update existing lead with email inquiry interaction
                lead = await this.updateLeadWithEmailInquiry(lead, body);
            } else {
                // Create new lead from email
                lead = await this.createLeadFromEmail(senderEmail, property, agent, subject, body);
            }

            // Analyze email intent using AI
            const intentAnalysis = await this.analyzeEmailIntent(body);
            if (intentAnalysis) {
                lead.aiEngagement.aiActions.push({
                    action: 'email_intent_analyzed',
                    timestamp: new Date(),
                    success: true,
                    reasoning: intentAnalysis.reasoning,
                    outcome: `Intent: ${intentAnalysis.intent}, Urgency: ${intentAnalysis.urgency}`
                });
                await lead.save();
            }

            // Trigger agent notifications
            await agentNotificationService.notifyEmailInquiry(lead._id);

            return { success: true, leadId: lead._id, isNew: !lead };
        } catch (error) {
            console.error('Error handling inbound email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update existing lead with email inquiry
     */
    async updateLeadWithEmailInquiry(lead, emailBody) {
        lead.aiEngagement.aiActions.push({
            action: 'email_inquiry_received',
            timestamp: new Date(),
            success: true,
            reasoning: 'Client sent email inquiry',
            outcome: 'Lead updated with email interaction',
            interactionType: 'email_inquiry',
            interactionSource: 'email',
            metadata: {
                emailLength: emailBody.length
            }
        });

        lead.aiEngagement.interactionMetrics.totalEmailInquiries += 1;
        lead.aiEngagement.interactionMetrics.lastInteractionAt = new Date();
        lead.aiEngagement.totalInteractions += 1;

        await lead.save();

        // Recalculate lead score
        const leadScoringService = require('./leadScoringService');
        await leadScoringService.scoreSpecificLead(lead._id);

        return lead;
    }

    /**
     * Create new lead from email inquiry
     */
    async createLeadFromEmail(senderEmail, property, agent, subject, body) {
        // Extract contact info from email signature or body
        const phoneNumber = this.extractPhoneNumber(body) || 'N/A';

        const leadData = {
            property: property._id,
            client: {
                name: this.extractName(body, senderEmail) || 'Email Inquiry',
                address: 'Provided via email',
                contact: phoneNumber,
                email: senderEmail,
                whatsappNumber: phoneNumber
            },
            dealType: this.determineDealType(subject, body, property),
            createdBy: agent._id,
            conversationHistory: [
                {
                    role: 'client',
                    message: `Email Subject: ${subject}\n\nMessage: ${body}`,
                    timestamp: new Date()
                }
            ],
            aiEngagement: {
                totalInteractions: 1,
                aiActions: [{
                    action: 'lead_captured_via_email',
                    timestamp: new Date(),
                    success: true,
                    reasoning: 'Lead created from email inquiry',
                    outcome: 'New lead created',
                    interactionType: 'email_inquiry',
                    interactionSource: 'email',
                    metadata: {
                        emailLength: body.length
                    }
                }],
                interactionMetrics: {
                    totalEmailInquiries: 1,
                    firstInteractionAt: new Date(),
                    lastInteractionAt: new Date()
                }
            }
        };

        const lead = await Lead.create(leadData);

        // Calculate initial score
        const leadScoringService = require('./leadScoringService');
        await leadScoringService.scoreSpecificLead(lead._id);

        return lead;
    }

    /**
     * Parse SendGrid inbound webhook payload
     * @param {Object} rawPayload - Raw webhook payload from SendGrid
     */
    parseSendGridInbound(rawPayload) {
        return {
            from: rawPayload.from,
            to: rawPayload.to,
            subject: rawPayload.subject,
            text: rawPayload.text,
            html: rawPayload.html,
            headers: rawPayload.headers,
            attachments: rawPayload.attachments || []
        };
    }

    /**
     * Parse Gmail message to emailData format
     * @param {Object} gmailMessage - Parsed Gmail message from gmailService
     */
    parseGmailMessage(gmailMessage) {
        return {
            from: gmailMessage.from,
            to: gmailMessage.to,
            subject: gmailMessage.subject,
            text: gmailMessage.text || gmailService.stripHtml(gmailMessage.html),
            html: gmailMessage.html,
            headers: {},
            attachments: [],
            messageId: gmailMessage.id
        };
    }

    /**
     * Handle Gmail inbound email
     * @param {Object} gmailMessage - Parsed Gmail message
     */
    async handleGmailInbound(gmailMessage) {
        try {
            console.log('Processing Gmail message:', gmailMessage.id);

            const emailData = this.parseGmailMessage(gmailMessage);
            const result = await this.handleInboundEmail(emailData);

            // Mark as read after processing
            if (result.success && gmailMessage.id) {
                await gmailService.markAsRead(gmailMessage.id);
            }

            return result;
        } catch (error) {
            console.error('Error handling Gmail message:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Poll Gmail for new emails and process them
     * Can be called via cron job
     */
    async pollGmailForNewEmails() {
        try {
            console.log('📧 Polling Gmail for new emails...');

            const messages = await gmailService.pollForNewEmails();
            console.log(`Found ${messages.length} new emails to process`);

            const results = [];
            for (const message of messages) {
                const result = await this.handleGmailInbound(message);
                results.push({ messageId: message.id, result });
            }

            console.log(`✅ Processed ${results.length} Gmail messages`);
            return results;
        } catch (error) {
            console.error('Error polling Gmail:', error);
            return [];
        }
    }

    /**
     * AI-powered email intent analysis
     * Uses pattern matching and keyword extraction
     * In production, could use Gemini API for deeper analysis
     */
    async analyzeEmailIntent(emailBody) {
        try {
            const bodyLower = emailBody.toLowerCase();

            // Intent keywords
            const urgentKeywords = ['urgent', 'asap', 'immediately', 'right away', 'today', 'now'];
            const buyingKeywords = ['buy', 'purchase', 'acquire', 'invest', 'interested in buying'];
            const viewingKeywords = ['view', 'see', 'visit', 'schedule', 'tour', 'inspection'];
            const budgetKeywords = ['budget', 'afford', 'price', 'cost', 'payment', 'financing'];
            const timelineKeywords = ['when', 'timeline', 'move in', 'available', 'ready'];

            // Calculate intent scores
            const urgencyScore = urgentKeywords.filter(kw => bodyLower.includes(kw)).length;
            const buyingIntentScore = buyingKeywords.filter(kw => bodyLower.includes(kw)).length;
            const viewingIntentScore = viewingKeywords.filter(kw => bodyLower.includes(kw)).length;
            const budgetScore = budgetKeywords.filter(kw => bodyLower.includes(kw)).length;
            const timelineScore = timelineKeywords.filter(kw => bodyLower.includes(kw)).length;

            // Determine primary intent
            let intent = 'general_inquiry';
            let urgency = 'medium';

            if (buyingIntentScore >= 2) intent = 'buying';
            else if (viewingIntentScore >= 2) intent = 'viewing';
            else if (budgetScore >= 2) intent = 'budget_inquiry';

            if (urgencyScore >= 2) urgency = 'high';
            else if (urgencyScore >= 1) urgency = 'medium';
            else urgency = 'low';

            const reasoning = `Detected ${buyingIntentScore} buying signals, ${viewingIntentScore} viewing signals, ${urgencyScore} urgency indicators`;

            return {
                intent,
                urgency,
                buyingIntentScore,
                viewingIntentScore,
                urgencyScore,
                budgetScore,
                timelineScore,
                reasoning
            };
        } catch (error) {
            console.error('Error analyzing email intent:', error);
            return null;
        }
    }

    /**
     * Find property from email content
     * Looks for property ID, title, or reference in subject/body
     */
    async findPropertyFromEmail(subject, body) {
        try {
            // Method 1: Look for property ID (common format: #12345 or property/12345)
            const idPattern = /#([a-f0-9]{24})|property\/([a-f0-9]{24})|property_id[:\s]*([a-f0-9]{24})/i;
            const idMatch = (subject + ' ' + body).match(idPattern);

            if (idMatch) {
                const propertyId = idMatch[1] || idMatch[2] || idMatch[3];
                const property = await Property.findById(propertyId);
                if (property) return property;
            }

            // Method 2: Look for property title
            // Extract potential property titles (words in quotes or capitalized phrases)
            const titlePattern = /"([^"]+)"|'([^']+)'/g;
            const matches = [...(subject + ' ' + body).matchAll(titlePattern)];

            for (const match of matches) {
                const potentialTitle = match[1] || match[2];
                const property = await Property.findOne({
                    title: new RegExp(potentialTitle, 'i')
                });
                if (property) return property;
            }

            // Method 3: Look for property-specific keywords
            // Try to find most recently listed property by agent mentioned in 'to' field
            // This is a fallback - in production, email forwarding should include property ID

            return null;
        } catch (error) {
            console.error('Error finding property from email:', error);
            return null;
        }
    }

    /**
     * Extract email address from 'From' field
     */
    extractEmail(fromField) {
        const emailPattern = /<([^>]+)>|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
        const match = fromField.match(emailPattern);
        return match ? (match[1] || match[2]) : fromField;
    }

    /**
     * Extract name from email body or from field
     */
    extractName(body, fromField) {
        // Try to extract name from signature
        const lines = body.split('\n');
        for (let i = 0; i < Math.min(3, lines.length); i++) {
            const line = lines[i].trim();
            if (line.length > 0 && line.length < 50 && !line.includes('@')) {
                return line;
            }
        }

        // Extract from email address (before @)
        const emailName = fromField.split('@')[0].replace(/[._]/g, ' ');
        return this.capitalizeWords(emailName);
    }

    /**
     * Extract phone number from email body
     */
    extractPhoneNumber(body) {
        // Kenyan phone number patterns
        const patterns = [
            /\+254\s?[17]\d{8}/,
            /254\s?[17]\d{8}/,
            /0[17]\d{8}/
        ];

        for (const pattern of patterns) {
            const match = body.match(pattern);
            if (match) return match[0].replace(/\s/g, '');
        }

        return null;
    }

    /**
     * Determine deal type from email content
     */
    determineDealType(subject, body, property) {
        const combinedText = (subject + ' ' + body).toLowerCase();

        if (combinedText.includes('rent') || combinedText.includes('rental') || combinedText.includes('lease')) {
            return 'rental';
        }
        if (combinedText.includes('buy') || combinedText.includes('purchase')) {
            return 'purchase';
        }
        if (combinedText.includes('view') || combinedText.includes('visit') || combinedText.includes('tour')) {
            return 'viewing';
        }

        // Default to property's price type
        return property.priceType === 'rental' ? 'rental' : 'purchase';
    }

    /**
     * Capitalize words
     */
    capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Find agent from email address (recipient)
     */
    async findAgentFromEmail(toAddress) {
        try {
            const email = this.extractEmail(toAddress);
            const agent = await User.findOne({ email, role: { $in: ['Agent', 'Property Seller', 'Landlord'] } });
            return agent;
        } catch (error) {
            console.error('Error finding agent:', error);
            return null;
        }
    }
}

module.exports = new EmailInquiryService();
