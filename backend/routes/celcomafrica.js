const express = require('express');
const router = express.Router();
const celcomAfricaService = require('../services/celcomAfricaService');

/**
 * Test SMS sending via Celcom Africa
 * POST /api/celcomafrica/test-sms
 * Body: { phone: "0712345678", message: "Test message" }
 */
router.post('/test-sms', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const testMessage = message || 'Test SMS from My Genesis Fortune via Celcom Africa. If you received this, the integration is working! 🎉';

        const result = await celcomAfricaService.sendSMS({
            to: phone,
            message: testMessage
        });

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'SMS sent successfully',
                details: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error,
                details: result
            });
        }
    } catch (error) {
        console.error('❌ Test SMS error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get account balance
 * GET /api/celcomafrica/balance
 */
router.get('/balance', async (req, res) => {
    try {
        const result = await celcomAfricaService.getBalance();

        if (result.success) {
            res.status(200).json({
                success: true,
                balance: result.balance
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('❌ Balance check error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get delivery report for a message
 * GET /api/celcomafrica/delivery-report?messageId=123456
 */
router.get('/delivery-report', async (req, res) => {
    try {
        const { messageId } = req.query;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                error: 'Message ID is required'
            });
        }

        const result = await celcomAfricaService.getDeliveryReport({ messageId });

        if (result.success) {
            res.status(200).json({
                success: true,
                deliveryReport: result.deliveryReport
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('❌ Delivery report error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get health status of Celcom Africa service
 * GET /api/celcomafrica/health
 */
router.get('/health', (req, res) => {
    try {
        const health = celcomAfricaService.getHealthStatus();
        res.status(200).json({
            success: true,
            service: 'Celcom Africa',
            ...health
        });
    } catch (error) {
        console.error('❌ Health check error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Test phone number formatting
 * GET /api/celcomafrica/format-phone?phone=0712345678
 */
router.get('/format-phone', (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const formatted = celcomAfricaService.formatPhoneNumber(phone);

        res.status(200).json({
            success: true,
            original: phone,
            formatted: formatted
        });
    } catch (error) {
        console.error('❌ Format phone error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Webhook endpoint for delivery reports (optional)
 * POST /api/celcomafrica/webhook/dlr
 */
router.post('/webhook/dlr', (req, res) => {
    try {
        const { messageid, status, mobile } = req.body;
        console.log('📨 Celcom Africa DLR received:', { messageid, status, mobile });

        // You can store this in database or trigger actions here
        // For now, just log and acknowledge

        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ DLR webhook error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
