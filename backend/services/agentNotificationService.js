const User = require('../models/User');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const celcomAfricaService = require('./celcomAfricaService');
const whatsappService = require('./whatsappService');
const emailService = require('./emailService');

/**
 * Agent Notification Service
 * Orchestrates multi-channel notifications to agents based on their preferences
 */
class AgentNotificationService {
    /**
     * Main method: Notify agent about a captured lead
     * @param {String} leadId - Lead ID
     */
    async notifyLeadCaptured(leadId) {
        try {
            const lead = await Lead.findById(leadId).populate('property');
            if (!lead || !lead.property) {
                console.error('Lead or property not found:', leadId);
                return { success: false, error: 'Lead or property not found' };
            }

            const agent = await User.findById(lead.createdBy);
            if (!agent) {
                console.error('Agent not found:', lead.createdBy);
                return { success: false, error: 'Agent not found' };
            }

            const preferences = this.getAgentPreferences(agent, 'leadCaptured');

            // Check if this interaction type is enabled
            if (!preferences.enabled) {
                console.log('Lead captured notifications disabled for agent:', agent._id);
                return { success: true, skipped: true };
            }

            const results = await this.sendToChannels(agent, lead, lead.property, preferences.channels, 'leadCaptured');

            // Check if high-score lead and send additional notification
            if (lead.score >= preferences.scoreThreshold) {
                await this.notifyHighScoreLead(leadId);
            }

            return { success: true, results };
        } catch (error) {
            console.error('Error in notifyLeadCaptured:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notify agent about an email inquiry
     * @param {String} leadId - Lead ID
     */
    async notifyEmailInquiry(leadId) {
        try {
            const lead = await Lead.findById(leadId).populate('property');
            if (!lead || !lead.property) {
                console.error('Lead or property not found:', leadId);
                return { success: false, error: 'Lead or property not found' };
            }

            const agent = await User.findById(lead.createdBy);
            if (!agent) {
                console.error('Agent not found:', lead.createdBy);
                return { success: false, error: 'Agent not found' };
            }

            const preferences = this.getAgentPreferences(agent, 'emailInquiry');

            if (!preferences.enabled) {
                console.log('Email inquiry notifications disabled for agent:', agent._id);
                return { success: true, skipped: true };
            }

            const results = await this.sendToChannels(agent, lead, lead.property, preferences.channels, 'emailInquiry');

            return { success: true, results };
        } catch (error) {
            console.error('Error in notifyEmailInquiry:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notify agent about a high-score lead
     * @param {String} leadId - Lead ID
     */
    async notifyHighScoreLead(leadId) {
        try {
            const lead = await Lead.findById(leadId).populate('property');
            if (!lead || !lead.property) {
                return { success: false, error: 'Lead or property not found' };
            }

            const agent = await User.findById(lead.createdBy);
            if (!agent) {
                return { success: false, error: 'Agent not found' };
            }

            const preferences = this.getAgentPreferences(agent, 'highScoreLead');

            if (!preferences.enabled || lead.score < preferences.scoreThreshold) {
                return { success: true, skipped: true };
            }

            const results = await this.sendToChannels(agent, lead, lead.property, preferences.channels, 'highScoreLead');

            return { success: true, results };
        } catch (error) {
            console.error('Error in notifyHighScoreLead:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send notifications to multiple channels
     * @param {Object} agent - Agent user object
     * @param {Object} lead - Lead object
     * @param {Object} property - Property object
     * @param {Array} channels - Array of channel names to send to
     * @param {String} notificationType - Type of notification
     */
    async sendToChannels(agent, lead, property, channels, notificationType) {
        const results = {};

        for (const channel of channels) {
            // Check rate limit before sending
            const rateLimitOk = await this.checkRateLimit(agent._id, channel);
            if (!rateLimitOk) {
                console.log(`Rate limit exceeded for ${channel} channel for agent:`, agent._id);
                results[channel] = { success: false, error: 'Rate limit exceeded' };
                continue;
            }

            try {
                switch (channel) {
                    case 'sms':
                        results.sms = await this.sendSMSNotification(agent, lead, property, notificationType);
                        break;
                    case 'whatsapp':
                        results.whatsapp = await this.sendWhatsAppNotification(agent, lead, property, notificationType);
                        break;
                    case 'email':
                        results.email = await this.sendEmailNotification(agent, lead, property, notificationType);
                        break;
                    case 'inApp':
                        results.inApp = await this.sendInAppNotification(agent, lead, property, notificationType);
                        break;
                }
            } catch (error) {
                console.error(`Error sending ${channel} notification:`, error);
                results[channel] = { success: false, error: error.message };
            }
        }

        return results;
    }

    /**
     * Send SMS notification
     */
    async sendSMSNotification(agent, lead, property, notificationType) {
        try {
            const phoneNumber = agent.agentProfile?.notificationPreferences?.channels?.sms?.phoneNumber || agent.phone;

            if (!phoneNumber) {
                return { success: false, error: 'No phone number available' };
            }

            const message = this.buildSMSMessage(lead, property, notificationType);
            const result = await celcomAfricaService.sendSMS({
                to: phoneNumber,
                message: message
            });

            await this.trackNotificationDelivery(agent._id, 'sms', result.success);

            return result;
        } catch (error) {
            console.error('Error sending SMS:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send WhatsApp notification
     */
    async sendWhatsAppNotification(agent, lead, property, notificationType) {
        try {
            const phoneNumber = agent.agentProfile?.notificationPreferences?.channels?.whatsapp?.phoneNumber || agent.whatsappNumber;

            if (!phoneNumber) {
                return { success: false, error: 'No WhatsApp number available' };
            }

            const message = this.buildWhatsAppMessage(lead, property, notificationType);
            const result = await whatsappService.sendNotification(phoneNumber, message);

            await this.trackNotificationDelivery(agent._id, 'whatsapp', result.success);

            return result;
        } catch (error) {
            console.error('Error sending WhatsApp:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send Email notification
     */
    async sendEmailNotification(agent, lead, property, notificationType) {
        try {
            const emailAddress = agent.agentProfile?.notificationPreferences?.channels?.email?.emailAddress || agent.email;

            if (!emailAddress) {
                return { success: false, error: 'No email address available' };
            }

            const { subject, html } = this.buildEmailMessage(agent, lead, property, notificationType);
            const result = await emailService.sendEmail({
                to: emailAddress,
                subject: subject,
                html: html
            });

            await this.trackNotificationDelivery(agent._id, 'email', result.success);

            return result;
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send In-app notification
     */
    async sendInAppNotification(agent, lead, property, notificationType) {
        try {
            const notificationData = {
                user: agent._id,
                type: this.getNotificationType(notificationType),
                title: this.getNotificationTitle(notificationType, lead),
                message: this.getNotificationMessage(lead, property, notificationType),
                metadata: {
                    leadId: lead._id,
                    propertyId: property._id,
                    dealType: lead.dealType,
                    clientName: lead.client.name,
                    link: `/dashboard/leads/${lead._id}`
                }
            };

            const notification = await Notification.create(notificationData);

            await this.trackNotificationDelivery(agent._id, 'inApp', true);

            return { success: true, notificationId: notification._id };
        } catch (error) {
            console.error('Error creating in-app notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get agent preferences for specific interaction type
     */
    getAgentPreferences(agent, interactionType) {
        const preferences = agent.agentProfile?.notificationPreferences?.interactionTypes?.[interactionType];

        // Return defaults if preferences not set
        if (!preferences) {
            const defaults = {
                leadCaptured: {
                    enabled: true,
                    channels: ['whatsapp', 'inApp'],
                    priority: 'high',
                    scoreThreshold: 75
                },
                emailInquiry: {
                    enabled: true,
                    channels: ['email', 'inApp'],
                    priority: 'high',
                    scoreThreshold: 75
                },
                highScoreLead: {
                    enabled: true,
                    channels: ['sms', 'whatsapp', 'inApp'],
                    priority: 'urgent',
                    scoreThreshold: 75
                }
            };

            return defaults[interactionType] || defaults.leadCaptured;
        }

        return preferences;
    }

    /**
     * Check rate limit for a channel
     */
    async checkRateLimit(agentId, channel) {
        // TODO: Implement Redis-based rate limiting in production
        // For now, return true (no rate limiting)
        // In production, check against rateLimits in agent preferences
        return true;
    }

    /**
     * Track notification delivery
     */
    async trackNotificationDelivery(agentId, channel, success) {
        // TODO: Store notification delivery metrics in database
        // This could be a separate NotificationLog model for analytics
        console.log(`Notification sent - Agent: ${agentId}, Channel: ${channel}, Success: ${success}`);
    }

    /**
     * Build SMS message
     */
    buildSMSMessage(lead, property, notificationType) {
        const baseURL = process.env.FRONTEND_URL || 'https://mygenesisfortune.com';
        const dashboardLink = `${baseURL}/dashboard/leads/${lead._id}`;

        if (notificationType === 'highScoreLead') {
            return `🔥 HIGH PRIORITY LEAD: ${lead.client.name}

Property: ${property.title}
Score: ${lead.score}/100 (${lead.buyingIntent} intent)
Type: ${lead.dealType}

Contact: ${lead.client.contact}
View: ${dashboardLink}

- MyGF AI`;
        }

        return `🎉 New Lead: ${lead.client.name}

Property: ${property.title}
Type: ${lead.dealType}
Score: ${lead.score}/100
Intent: ${lead.buyingIntent}

Contact: ${lead.client.contact}
View: ${dashboardLink}

- MyGF AI`;
    }

    /**
     * Build WhatsApp message
     */
    buildWhatsAppMessage(lead, property, notificationType) {
        const baseURL = process.env.FRONTEND_URL || 'https://mygenesisfortune.com';
        const dashboardLink = `${baseURL}/dashboard/leads/${lead._id}`;
        const interactionType = lead.aiEngagement?.aiActions?.[lead.aiEngagement.aiActions.length - 1]?.interactionType || 'unknown';

        if (notificationType === 'highScoreLead') {
            return `🔥 *HIGH PRIORITY LEAD CAPTURED!*

*Property:* ${property.title}
*Lead Score:* ${lead.score}/100 (${lead.buyingIntent} intent) 🎯

*Client Details:*
👤 Name: ${lead.client.name}
📧 Email: ${lead.client.email}
📱 Phone: ${lead.client.contact}
💬 WhatsApp: ${lead.client.whatsappNumber}
📍 Address: ${lead.client.address}

*Interaction:* ${interactionType}
*Deal Type:* ${lead.dealType}

⚡ *Action Required:* Contact this lead ASAP!

View full details: ${dashboardLink}

---
MyGF AI - Smart Real Estate Assistant`;
        }

        return `🎉 *New ${lead.dealType} Lead Captured!*

*Property:* ${property.title}
*Lead Score:* ${lead.score}/100 (${lead.buyingIntent} intent)

*Client Details:*
👤 Name: ${lead.client.name}
📧 Email: ${lead.client.email}
📱 Phone: ${lead.client.contact}
💬 WhatsApp: ${lead.client.whatsappNumber}
📍 Address: ${lead.client.address}

*Interaction:* ${interactionType}

View full details: ${dashboardLink}

---
MyGF AI - Smart Real Estate Assistant`;
    }

    /**
     * Build email message
     */
    buildEmailMessage(agent, lead, property, notificationType) {
        const baseURL = process.env.FRONTEND_URL || 'https://mygenesisfortune.com';
        const dashboardLink = `${baseURL}/dashboard/leads/${lead._id}`;
        const intentBadgeClass = this.getIntentBadgeClass(lead.buyingIntent);
        const interactionType = lead.aiEngagement?.aiActions?.[lead.aiEngagement.aiActions.length - 1]?.interactionType || 'unknown';
        const interactionSource = lead.aiEngagement?.aiActions?.[lead.aiEngagement.aiActions.length - 1]?.interactionSource || 'unknown';

        const subject = notificationType === 'highScoreLead'
            ? `🔥 HIGH PRIORITY LEAD: ${lead.client.name} - ${property.title}`
            : `🎉 New Lead: ${lead.client.name} - ${property.title}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .score-badge { display: inline-block; background: white; color: #667eea; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .intent-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin-left: 10px; }
        .intent-very-high { background: #10b981; color: white; }
        .intent-high { background: #3b82f6; color: white; }
        .intent-medium { background: #f59e0b; color: white; }
        .intent-low { background: #6b7280; color: white; }
        .content { background: #f9fafb; padding: 30px; }
        .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section h2 { margin-top: 0; color: #667eea; font-size: 18px; }
        table { width: 100%; }
        table td { padding: 8px 0; }
        table td:first-child { font-weight: bold; color: #666; width: 40%; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: bold; }
        .cta-button.secondary { background: #10b981; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .urgent-banner { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${notificationType === 'highScoreLead' ? '🔥 HIGH PRIORITY LEAD!' : '🎉 New Lead Captured!'}</h1>
            <div class="score-badge">${lead.score}/100</div>
            <span class="intent-badge ${intentBadgeClass}">${lead.buyingIntent} intent</span>
        </div>

        <div class="content">
            ${notificationType === 'highScoreLead' ? `
            <div class="urgent-banner">
                <strong>⚡ Action Required:</strong> This is a high-score lead with strong buying intent. Contact them as soon as possible!
            </div>
            ` : ''}

            <div class="section">
                <h2>Property Details</h2>
                <table>
                    <tr><td>Property:</td><td>${property.title}</td></tr>
                    <tr><td>Location:</td><td>${property.location || 'N/A'}</td></tr>
                    <tr><td>Price:</td><td>${property.price ? property.currency + ' ' + property.price.toLocaleString() : 'N/A'}</td></tr>
                    <tr><td>Deal Type:</td><td>${lead.dealType}</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>Client Information</h2>
                <table>
                    <tr><td>Name:</td><td>${lead.client.name}</td></tr>
                    <tr><td>Email:</td><td><a href="mailto:${lead.client.email}">${lead.client.email}</a></td></tr>
                    <tr><td>Phone:</td><td><a href="tel:${lead.client.contact}">${lead.client.contact}</a></td></tr>
                    <tr><td>WhatsApp:</td><td><a href="https://wa.me/${lead.client.whatsappNumber}">${lead.client.whatsappNumber}</a></td></tr>
                    <tr><td>Address:</td><td>${lead.client.address}</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>Interaction Details</h2>
                <table>
                    <tr><td>Source:</td><td>${interactionSource}</td></tr>
                    <tr><td>Type:</td><td>${interactionType}</td></tr>
                    <tr><td>Lead Score:</td><td>${lead.score}/100</td></tr>
                    <tr><td>Buying Intent:</td><td>${lead.buyingIntent}</td></tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${dashboardLink}" class="cta-button">View in Dashboard</a>
                <a href="mailto:${lead.client.email}" class="cta-button secondary">Email Client</a>
                <a href="https://wa.me/${lead.client.whatsappNumber}" class="cta-button secondary">WhatsApp Client</a>
            </div>
        </div>

        <div class="footer">
            <p>MyGF AI - Your Smart Real Estate Assistant</p>
            <p><a href="${baseURL}/dashboard/settings/notifications">Notification Preferences</a></p>
        </div>
    </div>
</body>
</html>`;

        return { subject, html };
    }

    /**
     * Get intent badge CSS class
     */
    getIntentBadgeClass(buyingIntent) {
        const classes = {
            'very-high': 'intent-very-high',
            'high': 'intent-high',
            'medium': 'intent-medium',
            'low': 'intent-low'
        };
        return classes[buyingIntent] || 'intent-medium';
    }

    /**
     * Get notification type for in-app
     */
    getNotificationType(notificationType) {
        const types = {
            'leadCaptured': 'lead_captured',
            'emailInquiry': 'purchase_inquiry',
            'highScoreLead': 'lead_captured'
        };
        return types[notificationType] || 'lead_captured';
    }

    /**
     * Get notification title
     */
    getNotificationTitle(notificationType, lead) {
        if (notificationType === 'highScoreLead') {
            return `🔥 High Priority Lead: ${lead.client.name}`;
        }
        if (notificationType === 'emailInquiry') {
            return `📧 Email Inquiry: ${lead.client.name}`;
        }
        return `🎉 New Lead: ${lead.client.name}`;
    }

    /**
     * Get notification message
     */
    getNotificationMessage(lead, property, notificationType) {
        if (notificationType === 'highScoreLead') {
            return `High-score lead (${lead.score}/100) for ${property.title}. Contact ASAP!`;
        }
        if (notificationType === 'emailInquiry') {
            return `Email inquiry received for ${property.title}. Score: ${lead.score}/100`;
        }
        return `New ${lead.dealType} inquiry for ${property.title}. Score: ${lead.score}/100`;
    }

    /**
     * Send test notification to agent
     * @param {String} agentId - Agent user ID
     */
    async sendTestNotification(agentId) {
        try {
            const agent = await User.findById(agentId);
            if (!agent) {
                return { success: false, error: 'Agent not found' };
            }

            // Create a mock lead and property for testing
            const mockLead = {
                _id: 'test123',
                client: {
                    name: 'Test Client',
                    email: 'test@example.com',
                    contact: '+254712345678',
                    whatsappNumber: '+254712345678',
                    address: 'Test Address, Nairobi'
                },
                dealType: 'purchase',
                score: 85,
                buyingIntent: 'high',
                aiEngagement: {
                    aiActions: [{
                        interactionType: 'connect_now',
                        interactionSource: 'property_explorer'
                    }]
                }
            };

            const mockProperty = {
                _id: 'property123',
                title: 'Test Property - 3BR Apartment',
                location: 'Westlands, Nairobi',
                price: 15000000,
                currency: 'KSh'
            };

            const preferences = this.getAgentPreferences(agent, 'leadCaptured');
            const results = await this.sendToChannels(agent, mockLead, mockProperty, preferences.channels, 'leadCaptured');

            return { success: true, results };
        } catch (error) {
            console.error('Error sending test notification:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new AgentNotificationService();
