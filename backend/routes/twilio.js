const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilioService');
const whatsappService = require('../services/whatsappService');
const whatsappTemplateService = require('../services/whatsappTemplateService');
const whatsappInboundService = require('../services/whatsappInboundService');
const whatsappDeepLink = require('../utils/whatsappDeepLink');

/**
 * Twilio Webhook for SMS/WhatsApp Status Callbacks
 * @route POST /api/twilio/status
 * @desc Receive delivery status updates from Twilio
 * @access Public (but validated by Twilio signature)
 */
router.post('/status', (req, res) => {
    try {
        const {
            MessageSid,
            MessageStatus,
            To,
            From,
            Body,
            ErrorCode,
            ErrorMessage
        } = req.body;

        console.log('📱 Twilio Status Callback:', {
            sid: MessageSid,
            status: MessageStatus,
            to: To,
            from: From,
            error: ErrorCode ? `${ErrorCode}: ${ErrorMessage}` : null
        });

        // Log status for monitoring (you can save to database here)
        if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
            console.error(`❌ Message ${MessageSid} failed: ${ErrorMessage}`);
        } else if (MessageStatus === 'delivered') {
            console.log(`✅ Message ${MessageSid} delivered successfully`);
        }

        // Respond to Twilio
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing Twilio status callback:', error);
        res.status(500).send('Error processing callback');
    }
});

/**
 * Twilio Webhook for Incoming WhatsApp Messages
 * @route POST /api/twilio/inbound
 * @desc Receive inbound WhatsApp messages and attach to leads
 * @access Public
 */
router.post('/inbound', async (req, res) => {
    try {
        const result = await whatsappInboundService.handleInboundMessage(req.body);
        if (!result.success) {
            console.warn('WhatsApp inbound processing failed:', result.error);
        }

        res.type('text/xml');
        res.status(200).send('<Response></Response>');
    } catch (error) {
        console.error('Error processing WhatsApp inbound webhook:', error);
        res.type('text/xml');
        res.status(200).send('<Response></Response>');
    }
});

/**
 * Twilio Webhook Fallback for Incoming Messages
 * @route POST /api/twilio/inbound-fallback
 * @desc Fallback endpoint when inbound webhook fails
 * @access Public
 */
router.post('/inbound-fallback', (req, res) => {
    console.warn('Twilio inbound fallback hit:', req.body?.From || req.body?.from || 'unknown sender');
    res.type('text/xml');
    res.status(200).send('<Response></Response>');
});

/**
 * SendGrid Webhook for Email Events
 * @route POST /api/twilio/email-events
 * @desc Receive email event updates from SendGrid
 * @access Public (but validated by SendGrid signature)
 */
router.post('/email-events', (req, res) => {
    try {
        const events = req.body;

        if (Array.isArray(events)) {
            events.forEach(event => {
                console.log('📧 SendGrid Event:', {
                    email: event.email,
                    event: event.event,
                    timestamp: event.timestamp,
                    reason: event.reason || null
                });

                // Log important events
                if (event.event === 'bounce' || event.event === 'dropped') {
                    console.error(`❌ Email to ${event.email} ${event.event}: ${event.reason}`);
                } else if (event.event === 'delivered') {
                    console.log(`✅ Email delivered to ${event.email}`);
                }
            });
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing SendGrid webhook:', error);
        res.status(500).send('Error processing webhook');
    }
});

/**
 * Test Twilio Configuration
 * @route GET /api/twilio/health
 * @desc Check Twilio and SendGrid configuration status
 * @access Public
 */
router.get('/health', (req, res) => {
    const health = twilioService.getHealthStatus();
    res.json({
        success: true,
        ...health
    });
});

/**
 * Send Test Notification
 * @route POST /api/twilio/test
 * @desc Send test notification to verify integration
 * @access Private (add auth middleware in production)
 */
router.post('/test', async (req, res) => {
    try {
        const { phone, email, channel } = req.body;

        const testMessage = `
🧪 Test Message from MyGF AI

This is a test notification to verify your Twilio integration is working correctly.

Timestamp: ${new Date().toISOString()}

If you received this, your integration is working! ✅
        `.trim();

        let result;

        switch (channel) {
            case 'sms':
                if (!phone) {
                    return res.status(400).json({ success: false, error: 'Phone number required for SMS test' });
                }
                result = await twilioService.sendSMS({
                    to: phone,
                    message: testMessage
                });
                break;

            case 'whatsapp':
                if (!phone) {
                    return res.status(400).json({ success: false, error: 'Phone number required for WhatsApp test' });
                }
                result = await twilioService.sendWhatsApp({
                    to: phone,
                    message: testMessage
                });
                break;

            case 'email':
                if (!email) {
                    return res.status(400).json({ success: false, error: 'Email required for email test' });
                }
                result = await twilioService.sendEmail({
                    to: email,
                    subject: 'Test Email from MyGF AI',
                    text: testMessage,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #667eea;">🧪 Test Email from MyGF AI</h2>
                            <p>This is a test notification to verify your Twilio SendGrid integration is working correctly.</p>
                            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                            <p style="color: #10b981; font-weight: bold;">If you received this, your integration is working! ✅</p>
                        </div>
                    `
                });
                break;

            case 'multi':
                if (!phone && !email) {
                    return res.status(400).json({ success: false, error: 'Phone or email required for multi-channel test' });
                }
                result = await twilioService.sendMultiChannelNotification({
                    phone,
                    email,
                    message: testMessage,
                    subject: 'Test Notification from MyGF AI',
                    htmlEmail: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #667eea;">🧪 Test Notification from MyGF AI</h2>
                            <p>This is a multi-channel test notification.</p>
                            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                            <p style="color: #10b981; font-weight: bold;">Integration is working! ✅</p>
                        </div>
                    `
                });
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid channel. Use: sms, whatsapp, email, or multi'
                });
        }

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get WhatsApp Statistics
 * @route GET /api/twilio/whatsapp-stats
 * @desc Get WhatsApp messaging statistics and limits
 * @access Public
 */
router.get('/whatsapp-stats', (req, res) => {
    try {
        const stats = whatsappService.getStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error getting WhatsApp stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get WhatsApp Template Status
 * @route GET /api/twilio/template-status
 * @desc Get status of configured WhatsApp templates
 * @access Public
 */
router.get('/template-status', (req, res) => {
    try {
        const status = whatsappTemplateService.getStatus();
        res.json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('Error getting template status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate WhatsApp Deep Link
 * @route GET /api/twilio/deep-link
 * @desc Generate WhatsApp deep link with optional message
 * @access Public
 */
router.get('/deep-link', (req, res) => {
    try {
        const { message, propertyId, type } = req.query;

        let link;

        if (propertyId) {
            link = whatsappDeepLink.getPropertyReferenceLink(propertyId, message);
        } else if (type === 'qr') {
            link = whatsappDeepLink.getQRCodeUrl();
        } else if (message) {
            link = whatsappDeepLink.getLinkWithMessage(message);
        } else {
            link = whatsappDeepLink.getBasicLink();
        }

        res.json({
            success: true,
            deepLink: link,
            config: whatsappDeepLink.getDeepLinkConfig()
        });
    } catch (error) {
        console.error('Error generating deep link:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get WhatsApp Configuration
 * @route GET /api/twilio/whatsapp-config
 * @desc Get complete WhatsApp configuration and status
 * @access Public
 */
router.get('/whatsapp-config', (req, res) => {
    try {
        const stats = whatsappService.getStats();
        const templateStatus = whatsappTemplateService.getStatus();
        const deepLinkConfig = whatsappDeepLink.getDeepLinkConfig();

        res.json({
            success: true,
            messaging: {
                stats,
                dailyLimitWarning: stats.remaining < 50,
                limitReached: stats.limitReached
            },
            templates: {
                configured: templateStatus.configured,
                availableCount: templateStatus.templatesLoaded,
                templates: templateStatus.availableTemplates
            },
            deepLink: deepLinkConfig,
            recommendations: generateRecommendations(stats, templateStatus)
        });
    } catch (error) {
        console.error('Error getting WhatsApp config:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate recommendations based on current status
 */
function generateRecommendations(stats, templateStatus) {
    const recommendations = [];

    // Check daily limit usage
    if (stats.remaining < 50 && stats.remaining > 0) {
        recommendations.push({
            type: 'warning',
            message: `Approaching daily message limit. ${stats.remaining} messages remaining.`,
            action: 'Consider prioritizing critical notifications only.'
        });
    } else if (stats.limitReached) {
        recommendations.push({
            type: 'critical',
            message: 'Daily message limit reached.',
            action: 'Limit resets at midnight UTC. Consider upgrading to higher tier.'
        });
    }

    // Check template configuration
    if (templateStatus.templatesLoaded === 0) {
        recommendations.push({
            type: 'info',
            message: 'No WhatsApp templates configured.',
            action: 'Submit templates for Meta approval to send notifications outside 24-hour window.'
        });
    } else if (templateStatus.templatesLoaded < 6) {
        recommendations.push({
            type: 'info',
            message: `Only ${templateStatus.templatesLoaded} template(s) configured.`,
            action: 'Consider submitting more templates for different notification types.'
        });
    }

    // Tier upgrade recommendation
    if (stats.messagesSentToday > 200) {
        recommendations.push({
            type: 'info',
            message: 'High message volume detected.',
            action: 'Maintain quality rating to upgrade to Tier 1 (1,000 messages/day).'
        });
    }

    return recommendations;
}

module.exports = router;
