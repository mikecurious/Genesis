const twilio = require('twilio');
const whatsappTemplates = require('../config/whatsappTemplates');

/**
 * WhatsApp Template Service
 *
 * Manages sending WhatsApp messages using pre-approved templates.
 * Templates are required for messages sent outside the 24-hour window.
 *
 * Template SIDs should be configured in .env after Meta approval:
 * - WHATSAPP_TEMPLATE_LEAD_NOTIFICATION
 * - WHATSAPP_TEMPLATE_VIEWING_CONFIRMATION
 * - WHATSAPP_TEMPLATE_RENT_REMINDER
 * - etc.
 */

class WhatsAppTemplateService {
    constructor() {
        this.twilioClient = null;
        this.isInitialized = false;
        this.templateSids = {};
        this.initialize();
    }

    /**
     * Initialize Twilio client and load template SIDs
     */
    initialize() {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;

            if (accountSid && authToken) {
                this.twilioClient = twilio(accountSid, authToken);
                this.isInitialized = true;
                console.log('✅ WhatsApp Template Service initialized');

                // Load template SIDs from environment
                this.loadTemplateSids();
            } else {
                console.warn('⚠️  WhatsApp Template Service: Twilio credentials not configured');
            }
        } catch (error) {
            console.error('❌ WhatsApp Template Service initialization error:', error.message);
        }
    }

    /**
     * Load template SIDs from environment variables
     */
    loadTemplateSids() {
        const templateKeys = Object.keys(whatsappTemplates);

        templateKeys.forEach(key => {
            const envKey = `WHATSAPP_TEMPLATE_${key}`;
            const sid = process.env[envKey];

            if (sid) {
                this.templateSids[key] = sid;
                console.log(`✅ Template loaded: ${key}`);
            } else {
                console.log(`⚠️  Template SID not found for ${key} (${envKey})`);
            }
        });

        if (Object.keys(this.templateSids).length === 0) {
            console.log('💡 No WhatsApp templates configured. Add template SIDs to .env after Meta approval.');
        }
    }

    /**
     * Format phone number for WhatsApp
     */
    formatWhatsAppNumber(phoneNumber) {
        if (!phoneNumber) return null;
        const cleanNumber = phoneNumber.replace('whatsapp:', '').trim();
        const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
        return `whatsapp:${formattedNumber}`;
    }

    /**
     * Check if service is configured
     */
    isConfigured() {
        return this.isInitialized && this.twilioClient !== null;
    }

    /**
     * Check if a specific template is available
     */
    isTemplateAvailable(templateKey) {
        return !!this.templateSids[templateKey];
    }

    /**
     * Send template message using Twilio Content API
     */
    async sendTemplateMessage({ to, templateKey, variables, from }) {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'WhatsApp Template Service not configured',
                fallbackToFreeform: true
            };
        }

        const templateSid = this.templateSids[templateKey];
        if (!templateSid) {
            console.log(`⚠️  Template ${templateKey} not configured. Using freeform message.`);
            return {
                success: false,
                error: `Template ${templateKey} not approved/configured`,
                fallbackToFreeform: true
            };
        }

        try {
            const fromNumber = from || process.env.TWILIO_WHATSAPP_NUMBER;
            if (!fromNumber) {
                return { success: false, error: 'WhatsApp sender number not configured' };
            }

            const toNumber = this.formatWhatsAppNumber(to);
            if (!toNumber) {
                return { success: false, error: 'Invalid recipient phone number' };
            }

            // Send message using template
            const result = await this.twilioClient.messages.create({
                from: fromNumber,
                to: toNumber,
                contentSid: templateSid,
                contentVariables: JSON.stringify(
                    variables.reduce((acc, val, idx) => {
                        acc[(idx + 1).toString()] = val;
                        return acc;
                    }, {})
                )
            });

            console.log(`✅ WhatsApp template message sent to ${to}. SID: ${result.sid}`);

            return {
                success: true,
                messageSid: result.sid,
                status: result.status,
                channel: 'whatsapp',
                templateUsed: templateKey
            };
        } catch (error) {
            console.error(`❌ Failed to send WhatsApp template to ${to}:`, error.message);

            // If template failed, suggest fallback to freeform
            return {
                success: false,
                error: error.message,
                channel: 'whatsapp',
                fallbackToFreeform: error.code === 63016 // Template not approved
            };
        }
    }

    /**
     * Send lead notification using template (if available) or freeform
     */
    async sendLeadNotification({ ownerPhone, leadData, propertyTitle, propertyLocation, propertyPrice }) {
        const dealTypeLabels = {
            purchase: '🏠 Purchase Inquiry',
            rental: '🔑 Rental Inquiry',
            viewing: '👁️ Viewing Request'
        };

        const dealTypeLabel = dealTypeLabels[leadData.dealType] || 'New Inquiry';

        const variables = [
            dealTypeLabel,
            propertyTitle,
            propertyLocation || 'N/A',
            propertyPrice || 'N/A',
            leadData.client.name,
            leadData.client.contact,
            leadData.client.email
        ];

        const result = await this.sendTemplateMessage({
            to: ownerPhone,
            templateKey: 'LEAD_NOTIFICATION',
            variables
        });

        // If template failed or not configured, return suggestion to use freeform
        if (!result.success && result.fallbackToFreeform) {
            console.log('💡 Falling back to freeform message (use whatsappService instead)');
        }

        return result;
    }

    /**
     * Send viewing confirmation using template
     */
    async sendViewingConfirmation({ clientPhone, clientName, propertyTitle, viewingDate, agentName, agentPhone }) {
        const variables = [
            clientName,
            propertyTitle,
            viewingDate,
            agentName,
            agentPhone
        ];

        return this.sendTemplateMessage({
            to: clientPhone,
            templateKey: 'VIEWING_CONFIRMATION',
            variables
        });
    }

    /**
     * Send rent reminder using template
     */
    async sendRentReminder({ tenantPhone, tenantName, propertyTitle, rentAmount, dueDate }) {
        const variables = [
            tenantName,
            propertyTitle,
            rentAmount.toLocaleString(),
            dueDate
        ];

        return this.sendTemplateMessage({
            to: tenantPhone,
            templateKey: 'RENT_REMINDER',
            variables
        });
    }

    /**
     * Send maintenance update using template
     */
    async sendMaintenanceUpdate({ recipientPhone, recipientName, propertyTitle, requestType, status, technicianName, estimatedTime }) {
        const variables = [
            recipientName,
            propertyTitle,
            requestType,
            status,
            technicianName || 'To be assigned',
            estimatedTime || 'TBD'
        ];

        return this.sendTemplateMessage({
            to: recipientPhone,
            templateKey: 'MAINTENANCE_UPDATE',
            variables
        });
    }

    /**
     * Send welcome message using template
     */
    async sendWelcomeMessage({ clientPhone, clientName }) {
        const variables = [clientName];

        return this.sendTemplateMessage({
            to: clientPhone,
            templateKey: 'WELCOME_MESSAGE',
            variables
        });
    }

    /**
     * Send payment confirmation using template
     */
    async sendPaymentConfirmation({ recipientPhone, recipientName, propertyTitle, amount, paymentMethod, transactionRef }) {
        const variables = [
            recipientName,
            propertyTitle,
            amount.toLocaleString(),
            paymentMethod,
            transactionRef
        ];

        return this.sendTemplateMessage({
            to: recipientPhone,
            templateKey: 'PAYMENT_CONFIRMATION',
            variables
        });
    }

    /**
     * Get list of configured templates
     */
    getConfiguredTemplates() {
        return Object.keys(this.templateSids).map(key => ({
            key,
            sid: this.templateSids[key],
            name: whatsappTemplates[key].name,
            category: whatsappTemplates[key].category
        }));
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            configured: this.isConfigured(),
            templatesLoaded: Object.keys(this.templateSids).length,
            availableTemplates: this.getConfiguredTemplates()
        };
    }
}

module.exports = new WhatsAppTemplateService();
