const cron = require('node-cron');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');
const Notification = require('../models/Notification');

class LeadScoringService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Initialize lead scoring and follow-up cron jobs
     */
    initialize() {
        // Run every hour to update lead scores and trigger follow-ups
        const scoringJob = cron.schedule('0 * * * *', async () => {
            console.log('📊 Running lead scoring update...');
            await this.updateAllLeadScores();
        });

        // Run every 6 hours to check for follow-ups
        const followUpJob = cron.schedule('0 */6 * * *', async () => {
            console.log('📧 Checking for pending follow-ups...');
            await this.processAutoFollowUps();
        });

        this.jobs.push(scoringJob, followUpJob);
        console.log('✅ Lead scoring service initialized');
    }

    /**
     * Calculate lead score based on multiple factors
     */
    async calculateLeadScore(lead, property = null) {
        try {
            const scores = {
                responseTime: 0,
                engagement: 0,
                budgetMatch: 0,
                urgency: 0,
                contactQuality: 0,
                interactionQuality: 0,
                intentSignals: 0
            };

            // 1. Response Time Score (max 20 points)
            const hoursSinceCreation = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceCreation < 1) {
                scores.responseTime = 20; // Very recent, high urgency
            } else if (hoursSinceCreation < 24) {
                scores.responseTime = 15;
            } else if (hoursSinceCreation < 72) {
                scores.responseTime = 10;
            } else {
                scores.responseTime = 5;
            }

            // 2. Engagement Score (max 25 points)
            const conversationLength = lead.conversationHistory?.length || 0;
            scores.engagement = Math.min(25, conversationLength * 5);

            // 3. Budget Match Score (max 25 points)
            if (property) {
                // If lead has shown interest in a specific property
                scores.budgetMatch = 25;
            } else {
                // Default score if no property linked
                scores.budgetMatch = 15;
            }

            // 4. Urgency Score (max 20 points)
            switch (lead.dealType) {
                case 'purchase':
                    scores.urgency = 20; // Buyers are usually more urgent
                    break;
                case 'rental':
                    scores.urgency = 15;
                    break;
                case 'viewing':
                    scores.urgency = 18; // Viewing requests show immediate interest
                    break;
                default:
                    scores.urgency = 10;
            }

            // 5. Contact Quality Score (max 10 points)
            let contactQuality = 0;
            if (lead.client?.email) contactQuality += 3;
            if (lead.client?.contact) contactQuality += 3;
            if (lead.client?.whatsappNumber) contactQuality += 2;
            if (lead.client?.address) contactQuality += 2;
            scores.contactQuality = contactQuality;

            // 6. Interaction Quality Score (max 15 points)
            const interactionTypes = lead.aiEngagement?.aiActions?.map(a => a.interactionType).filter(Boolean) || [];
            let interactionQuality = 0;

            // Email inquiry = high intent (10 points)
            if (interactionTypes.includes('email_inquiry')) interactionQuality += 10;
            // Connect Now = medium intent (5 points)
            if (interactionTypes.includes('connect_now')) interactionQuality += 5;
            // Multiple touchpoints = engaged (up to 5 points)
            interactionQuality += Math.min(5, interactionTypes.length);

            scores.interactionQuality = Math.min(15, interactionQuality);

            // 7. Intent Signals (max 10 points)
            // Analyze conversation history for buying signals
            const intentKeywords = ['buy', 'purchase', 'viewing', 'schedule', 'available', 'budget', 'move in', 'when can', 'interested', 'serious'];
            const conversationText = lead.conversationHistory?.join(' ').toLowerCase() || '';
            const intentSignals = intentKeywords.filter(kw => conversationText.includes(kw)).length;
            scores.intentSignals = Math.min(10, intentSignals * 2);

            // Calculate total score (max 125 points from all factors)
            const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

            // Normalize to 100-point scale
            const normalizedScore = Math.min(100, Math.round((totalScore / 125) * 100));

            // Determine buying intent based on normalized score
            let buyingIntent = 'low';
            if (normalizedScore >= 80) buyingIntent = 'very-high';
            else if (normalizedScore >= 60) buyingIntent = 'high';
            else if (normalizedScore >= 40) buyingIntent = 'medium';

            return {
                score: normalizedScore,
                scoreBreakdown: scores,
                buyingIntent
            };
        } catch (error) {
            console.error('Error calculating lead score:', error);
            return {
                score: 0,
                scoreBreakdown: {
                    responseTime: 0,
                    engagement: 0,
                    budgetMatch: 0,
                    urgency: 0,
                    contactQuality: 0,
                    interactionQuality: 0,
                    intentSignals: 0
                },
                buyingIntent: 'low'
            };
        }
    }

    /**
     * Update scores for all active leads
     */
    async updateAllLeadScores() {
        try {
            const activeLeads = await Lead.find({
                status: { $in: ['new', 'contacted', 'in-progress'] }
            }).populate('property');

            let updatedCount = 0;

            for (const lead of activeLeads) {
                const scoring = await this.calculateLeadScore(lead, lead.property);

                lead.score = scoring.score;
                lead.scoreBreakdown = scoring.scoreBreakdown;
                lead.buyingIntent = scoring.buyingIntent;

                await lead.save();
                updatedCount++;
            }

            console.log(`✅ Updated scores for ${updatedCount} leads`);
        } catch (error) {
            console.error('Error updating lead scores:', error);
        }
    }

    /**
     * Process automatic follow-ups for leads
     */
    async processAutoFollowUps() {
        try {
            const today = new Date();

            // Find leads that need follow-up
            const leadsNeedingFollowUp = await Lead.find({
                autoFollowUpEnabled: true,
                status: { $in: ['new', 'contacted', 'in-progress'] },
                $or: [
                    { nextFollowUpDate: { $lte: today } },
                    { nextFollowUpDate: null, lastFollowUpDate: null }
                ]
            }).populate('property createdBy');

            for (const lead of leadsNeedingFollowUp) {
                await this.sendFollowUp(lead);
            }

            console.log(`✅ Processed ${leadsNeedingFollowUp.length} follow-ups`);
        } catch (error) {
            console.error('Error processing follow-ups:', error);
        }
    }

    /**
     * Send follow-up to a lead
     */
    async sendFollowUp(lead) {
        try {
            const owner = lead.createdBy;
            const property = lead.property;

            // Check if owner has lead scoring feature enabled
            if (!owner?.featureFlags?.leadScoring?.enabled) {
                return;
            }

            const followUpInterval = owner.featureFlags?.leadScoring?.followUpInterval || 2;

            // Generate follow-up message based on lead status and score
            const message = this.generateFollowUpMessage(lead, property, owner);

            // Send via email
            if (lead.client?.email) {
                await this.sendFollowUpEmail(lead, property, owner, message);
            }

            // Send via WhatsApp if available
            if (lead.client?.whatsappNumber) {
                await whatsappService.sendNotification(
                    lead.client.whatsappNumber,
                    `Hi ${lead.client.name}, ${message}`
                );
            }

            // Update lead follow-up tracking
            lead.lastFollowUpDate = new Date();
            lead.nextFollowUpDate = new Date(Date.now() + followUpInterval * 24 * 60 * 60 * 1000);
            lead.followUpCount = (lead.followUpCount || 0) + 1;

            await lead.save();

            // Notify the property owner
            await Notification.create({
                user: owner._id,
                title: '📧 Follow-up Sent',
                message: `Automatic follow-up sent to ${lead.client.name} for ${property?.title || 'property inquiry'}`,
                type: 'lead',
                priority: 'low'
            });

            console.log(`✅ Follow-up sent to lead ${lead._id}`);
        } catch (error) {
            console.error(`Error sending follow-up to lead ${lead._id}:`, error);
        }
    }

    /**
     * Generate personalized follow-up message
     */
    generateFollowUpMessage(lead, property, owner) {
        const clientName = lead.client?.name || 'there';
        const propertyTitle = property?.title || 'the property you inquired about';

        const messages = {
            'very-high': `I hope this message finds you well. I wanted to follow up on your interest in ${propertyTitle}. Given your high level of engagement, I'd love to schedule a viewing at your earliest convenience. Are you available this week?`,
            'high': `I'm reaching out regarding ${propertyTitle}. I noticed your strong interest and wanted to see if you have any questions or would like to schedule a viewing. Please let me know how I can assist you.`,
            'medium': `Just following up on your inquiry about ${propertyTitle}. Have you had a chance to consider it further? I'm here to answer any questions you might have.`,
            'low': `I wanted to check in about your interest in ${propertyTitle}. If you'd like more information or have any questions, please don't hesitate to reach out.`
        };

        return messages[lead.buyingIntent] || messages['medium'];
    }

    /**
     * Send follow-up email
     */
    async sendFollowUpEmail(lead, property, owner, message) {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .property-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 15px 0; }
        .label { font-weight: bold; color: #667eea; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Follow-up on Your Property Inquiry</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Dear ${lead.client?.name || 'Valued Client'},</p>

                <p>${message}</p>

                ${property ? `
                <div style="margin: 20px 0;">
                    ${property.imageUrls && property.imageUrls[0] ? `<img src="${property.imageUrls[0]}" alt="${property.title}" class="property-image" />` : ''}
                    <h3>${property.title}</h3>
                    <p><span class="label">Location:</span> ${property.location}</p>
                    <p><span class="label">Price:</span> ${property.currency} ${property.price.toLocaleString()}</p>
                    ${property.bedrooms ? `<p><span class="label">Bedrooms:</span> ${property.bedrooms}</p>` : ''}
                    ${property.bathrooms ? `<p><span class="label">Bathrooms:</span> ${property.bathrooms}</p>` : ''}
                </div>
                ` : ''}

                <p>Best regards,<br>${owner.name}<br>${owner.email}<br>${owner.phone || ''}</p>

                <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                    This is an automated follow-up from MyGF AI Real Estate Platform.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        await emailService.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: lead.client.email,
            subject: `Follow-up: ${property?.title || 'Your Property Inquiry'}`,
            html: emailHtml,
            replyTo: owner.email
        });
    }

    /**
     * Manually score a specific lead
     */
    async scoreSpecificLead(leadId) {
        const lead = await Lead.findById(leadId).populate('property');
        if (!lead) {
            throw new Error('Lead not found');
        }

        const scoring = await this.calculateLeadScore(lead, lead.property);

        lead.score = scoring.score;
        lead.scoreBreakdown = scoring.scoreBreakdown;
        lead.buyingIntent = scoring.buyingIntent;

        await lead.save();

        return lead;
    }

    /**
     * Get high-priority leads for a user
     */
    async getHighPriorityLeads(userId, limit = 10) {
        return await Lead.find({
            createdBy: userId,
            status: { $in: ['new', 'contacted', 'in-progress'] },
            score: { $gte: 60 }
        })
            .populate('property')
            .sort({ score: -1, createdAt: -1 })
            .limit(limit);
    }

    /**
     * Stop all cron jobs
     */
    stop() {
        this.jobs.forEach(job => job.stop());
        console.log('🛑 Lead scoring service stopped');
    }
}

module.exports = new LeadScoringService();
