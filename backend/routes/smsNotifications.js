const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const smsHelper = require('../utils/smsHelper');

/**
 * SMS Notifications Test Routes
 * These routes are for testing the SMS notification system
 */

/**
 * Test sending a system alert
 * POST /api/sms-notifications/test-alert
 */
router.post('/test-alert', async (req, res) => {
    try {
        const { phone, message, priority } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone and message are required'
            });
        }

        const result = await notificationService.sendSystemAlert({
            to: phone,
            message,
            priority: priority || 'normal'
        });

        res.json(result);
    } catch (error) {
        console.error('Test alert error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending an OTP
 * POST /api/sms-notifications/test-otp
 */
router.post('/test-otp', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const result = await smsHelper.sendOTP(phone, {
            length: 6,
            expiryMinutes: 5
        });

        res.json(result);
    } catch (error) {
        console.error('Test OTP error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending a payment confirmation
 * POST /api/sms-notifications/test-payment
 */
router.post('/test-payment', async (req, res) => {
    try {
        const { phone, amount, transactionId, paymentMethod } = req.body;

        if (!phone || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Phone and amount are required'
            });
        }

        const result = await notificationService.sendPaymentConfirmation({
            to: phone,
            amount,
            transactionId: transactionId || 'TEST' + Date.now(),
            paymentMethod: paymentMethod || 'M-Pesa'
        });

        res.json(result);
    } catch (error) {
        console.error('Test payment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending a booking confirmation
 * POST /api/sms-notifications/test-booking
 */
router.post('/test-booking', async (req, res) => {
    try {
        const { phone, propertyTitle, checkIn, checkOut } = req.body;

        if (!phone || !propertyTitle) {
            return res.status(400).json({
                success: false,
                error: 'Phone and propertyTitle are required'
            });
        }

        const result = await notificationService.sendBookingConfirmation({
            to: phone,
            propertyTitle,
            checkIn: checkIn || new Date().toLocaleDateString(),
            checkOut: checkOut || new Date(Date.now() + 86400000).toLocaleDateString(),
            bookingId: 'BK' + Date.now()
        });

        res.json(result);
    } catch (error) {
        console.error('Test booking error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending a security alert
 * POST /api/sms-notifications/test-security
 */
router.post('/test-security', async (req, res) => {
    try {
        const { phone, alertType, details } = req.body;

        if (!phone || !alertType) {
            return res.status(400).json({
                success: false,
                error: 'Phone and alertType are required'
            });
        }

        const result = await notificationService.sendSecurityAlert({
            to: phone,
            alertType, // login, password_changed, suspicious_activity, account_locked
            details: details || 'Test security alert'
        });

        res.json(result);
    } catch (error) {
        console.error('Test security error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending a subscription update
 * POST /api/sms-notifications/test-subscription
 */
router.post('/test-subscription', async (req, res) => {
    try {
        const { phone, plan, status } = req.body;

        if (!phone || !plan || !status) {
            return res.status(400).json({
                success: false,
                error: 'Phone, plan, and status are required'
            });
        }

        const result = await notificationService.sendSubscriptionUpdate({
            to: phone,
            plan,
            status, // active, expired, expiring_soon
            expiresAt: new Date(Date.now() + 30 * 86400000) // 30 days from now
        });

        res.json(result);
    } catch (error) {
        console.error('Test subscription error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending a welcome SMS
 * POST /api/sms-notifications/test-welcome
 */
router.post('/test-welcome', async (req, res) => {
    try {
        const { phone, userName } = req.body;

        if (!phone || !userName) {
            return res.status(400).json({
                success: false,
                error: 'Phone and userName are required'
            });
        }

        const result = await smsHelper.sendWelcomeSMS(phone, userName);

        res.json(result);
    } catch (error) {
        console.error('Test welcome error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test sending a templated message
 * POST /api/sms-notifications/test-template
 */
router.post('/test-template', async (req, res) => {
    try {
        const { phone, templateName, variables } = req.body;

        if (!phone || !templateName || !variables) {
            return res.status(400).json({
                success: false,
                error: 'Phone, templateName, and variables are required'
            });
        }

        const result = await smsHelper.sendTemplatedMessage(phone, templateName, variables);

        res.json(result);
    } catch (error) {
        console.error('Test template error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test bulk SMS
 * POST /api/sms-notifications/test-bulk
 */
router.post('/test-bulk', async (req, res) => {
    try {
        const { phones, message } = req.body;

        if (!phones || !Array.isArray(phones) || phones.length === 0 || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phones (array) and message are required'
            });
        }

        const result = await smsHelper.sendBulkSMS(phones, message);

        res.json(result);
    } catch (error) {
        console.error('Test bulk error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get notification service health
 * GET /api/sms-notifications/health
 */
router.get('/health', (req, res) => {
    try {
        const health = notificationService.getHealthStatus();
        res.json({
            success: true,
            ...health
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get available templates
 * GET /api/sms-notifications/templates
 */
router.get('/templates', (req, res) => {
    try {
        res.json({
            success: true,
            templates: Object.keys(smsHelper.templates),
            details: smsHelper.templates
        });
    } catch (error) {
        console.error('Templates error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Validate phone number
 * GET /api/sms-notifications/validate-phone?phone=0712345678
 */
router.get('/validate-phone', (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const formatted = smsHelper.formatPhone(phone);
        const isValid = smsHelper.isValidPhone(phone);

        res.json({
            success: true,
            original: phone,
            formatted: formatted,
            isValid: isValid
        });
    } catch (error) {
        console.error('Validate phone error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
