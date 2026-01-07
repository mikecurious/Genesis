const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const atService = require('../services/africasTalkingService');

// Generic OK responder
const ok = (res) => res.status(200).send('OK');

// Delivery reports (SMS)
router.all('/sms/dlr', (req, res) => {
    logger.info('Africa\'s Talking SMS DLR', { payload: req.body || req.query });
    return ok(res);
});

// Inbound SMS
router.all('/sms/inbound', (req, res) => {
    logger.info('Africa\'s Talking SMS Inbound', { payload: req.body || req.query });
    return ok(res);
});

// Voice event callbacks
router.all('/voice/events', (req, res) => {
    logger.info('Africa\'s Talking Voice Event', { payload: req.body || req.query });
    return ok(res);
});

// Test endpoint to trigger SMS/Voice from within the deployed environment.
router.post('/test', async (req, res) => {
    try {
        const { smsTo, voiceTo } = req.body || {};
        const results = {};

        if (smsTo) {
            results.sms = await atService.sendSms({
                to: smsTo,
                message: 'AT test SMS from MyGF AI (sandbox).'
            });
        }

        if (voiceTo) {
            results.voice = await atService.makeVoiceCall({
                to: voiceTo
            });
        }

        res.status(200).json({ success: true, results });
    } catch (error) {
        const payload = error.response?.data || error.message;
        logger.error('Africa\'s Talking test failed', { error: payload });
        res.status(500).json({ success: false, error: payload });
    }
});

module.exports = router;
