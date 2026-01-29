const Lead = require('../models/Lead');
const PendingWhatsApp = require('../models/PendingWhatsApp');
const Property = require('../models/Property');
const User = require('../models/User');
const agentNotificationService = require('./agentNotificationService');
const leadScoringService = require('./leadScoringService');
const { normalizePhoneNumber } = require('../utils/phone');

class WhatsAppInboundService {
    extractDigits(phoneNumber) {
        return (phoneNumber || '').replace(/\D/g, '');
    }

    buildSyntheticEmail(phoneNumber) {
        const digits = this.extractDigits(phoneNumber);
        if (!digits) return null;
        return `whatsapp${digits}@mygenesisfortune.com`;
    }

    buildConversationEntry(body, payload) {
        return {
            role: 'user',
            text: body,
            message: body,
            channel: 'whatsapp',
            direction: 'inbound',
            timestamp: new Date(),
            metadata: {
                from: payload.From || payload.from || null,
                to: payload.To || payload.to || null,
                messageSid: payload.MessageSid || payload.SmsSid || null,
                waId: payload.WaId || null,
                profileName: payload.ProfileName || null
            }
        };
    }

    async findPropertyFromMessage(text) {
        try {
            const body = text || '';
            const idPattern = /#([a-f0-9]{24})|property\/([a-f0-9]{24})|property_id[:\s]*([a-f0-9]{24})/i;
            const idMatch = body.match(idPattern);

            if (idMatch) {
                const propertyId = idMatch[1] || idMatch[2] || idMatch[3];
                const property = await Property.findById(propertyId);
                if (property) return property;
            }

            return null;
        } catch (error) {
            console.error('Error finding property from WhatsApp message:', error);
            return null;
        }
    }

    determineDealType(text, property) {
        const combinedText = (text || '').toLowerCase();

        if (combinedText.includes('rent') || combinedText.includes('rental') || combinedText.includes('lease')) {
            return 'rental';
        }
        if (combinedText.includes('buy') || combinedText.includes('purchase')) {
            return 'purchase';
        }
        if (combinedText.includes('view') || combinedText.includes('visit') || combinedText.includes('tour')) {
            return 'viewing';
        }

        if (property) {
            return property.priceType === 'rental' ? 'rental' : 'purchase';
        }

        return 'purchase';
    }

    async findExistingLead(phoneNumber, property) {
        const query = { 'client.whatsappNumber': phoneNumber };
        if (property) {
            query.property = property._id;
        }
        return await Lead.findOne(query).sort('-createdAt');
    }

    async updateLeadWithInboundMessage(lead, messageEntry) {
        lead.conversationHistory = lead.conversationHistory || [];
        lead.conversationHistory.push(messageEntry);

        lead.aiEngagement = lead.aiEngagement || {
            totalInteractions: 0,
            aiActions: [],
            interactionMetrics: {}
        };

        lead.aiEngagement.aiActions.push({
            action: 'whatsapp_message_received',
            timestamp: new Date(),
            success: true,
            reasoning: 'Inbound WhatsApp message',
            outcome: 'Lead updated with WhatsApp conversation',
            interactionType: 'whatsapp_message',
            interactionSource: 'whatsapp',
            metadata: {
                messageLength: messageEntry.text.length
            }
        });

        lead.aiEngagement.interactionMetrics = lead.aiEngagement.interactionMetrics || {};
        lead.aiEngagement.interactionMetrics.totalChatMessages =
            (lead.aiEngagement.interactionMetrics.totalChatMessages || 0) + 1;
        lead.aiEngagement.interactionMetrics.lastInteractionAt = new Date();
        if (!lead.aiEngagement.interactionMetrics.firstInteractionAt) {
            lead.aiEngagement.interactionMetrics.firstInteractionAt = new Date();
        }
        lead.aiEngagement.totalInteractions = (lead.aiEngagement.totalInteractions || 0) + 1;

        await lead.save();

        // Recalculate lead score
        await leadScoringService.scoreSpecificLead(lead._id);

        return lead;
    }

    async createLeadFromInboundMessage(phoneNumber, profileName, body, property, payload) {
        const syntheticEmail = this.buildSyntheticEmail(phoneNumber);
        const dealType = this.determineDealType(body, property);
        const messageEntry = this.buildConversationEntry(body, payload || {
            From: phoneNumber,
            ProfileName: profileName
        });

        const leadData = {
            property: property._id,
            client: {
                name: profileName || 'WhatsApp Lead',
                address: 'Provided via WhatsApp',
                contact: phoneNumber,
                email: syntheticEmail,
                whatsappNumber: phoneNumber
            },
            dealType,
            createdBy: property.createdBy,
            status: 'new',
            conversationHistory: [messageEntry],
            notes: 'Inbound WhatsApp lead created automatically',
            aiEngagement: {
                totalInteractions: 1,
                aiActions: [{
                    action: 'lead_captured_via_whatsapp',
                    timestamp: new Date(),
                    success: true,
                    reasoning: 'Lead created from inbound WhatsApp message',
                    outcome: 'New lead created',
                    interactionType: 'whatsapp_message',
                    interactionSource: 'whatsapp',
                    metadata: {
                        messageLength: body.length
                    }
                }],
                interactionMetrics: {
                    totalChatMessages: 1,
                    firstInteractionAt: new Date(),
                    lastInteractionAt: new Date()
                }
            }
        };

        const lead = await Lead.create(leadData);

        await leadScoringService.scoreSpecificLead(lead._id);

        return lead;
    }

    async handleInboundMessage(payload) {
        try {
            const body = (payload.Body || '').trim();
            const fromNumber = normalizePhoneNumber(payload.From || payload.from);
            const profileName = payload.ProfileName || payload.profileName || null;

            if (!fromNumber || !body) {
                return { success: false, error: 'Missing From number or message body' };
            }

            const matchedProperty = await this.findPropertyFromMessage(body);

            let lead = await this.findExistingLead(fromNumber, matchedProperty);
            if (!lead && !matchedProperty) {
                lead = await this.findExistingLead(fromNumber, null);
            }

            if (lead) {
                const messageEntry = this.buildConversationEntry(body, payload);
                await this.updateLeadWithInboundMessage(lead, messageEntry);
                return { success: true, leadId: lead._id, isNew: false };
            }

            if (!matchedProperty) {
                const messageEntry = this.buildConversationEntry(body, payload);
                await PendingWhatsApp.findOneAndUpdate(
                    { phoneNumber: fromNumber },
                    {
                        $push: { messages: messageEntry },
                        $set: { updatedAt: new Date() },
                        $setOnInsert: { createdAt: new Date() }
                    },
                    { upsert: true, new: true }
                );

                return { success: true, pending: true };
            }

            const agent = await User.findById(matchedProperty.createdBy);
            if (!agent) {
                return { success: false, error: 'Agent not found for fallback property' };
            }

            lead = await this.createLeadFromInboundMessage(fromNumber, profileName, body, matchedProperty, payload);

            // Notify agent about new lead
            await agentNotificationService.notifyLeadCaptured(lead._id);

            return { success: true, leadId: lead._id, isNew: true };
        } catch (error) {
            console.error('Error handling inbound WhatsApp message:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new WhatsAppInboundService();
