const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

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

module.exports = router;
