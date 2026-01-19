const express = require('express');
const { sendEmail, handleInboundEmailWebhook, handleGmailWebhook, pollGmail } = require('../controllers/email');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/emails/send
// @desc    Send email through the platform
// @access  Public
router.post('/send', sendEmail);

// @route   POST /api/emails/inbound-webhook
// @desc    Handle inbound email webhook from SendGrid
// @access  Public (webhook)
router.post('/inbound-webhook', handleInboundEmailWebhook);

// @route   POST /api/emails/gmail-webhook
// @desc    Handle Gmail push notification webhook
// @access  Public (webhook)
router.post('/gmail-webhook', handleGmailWebhook);

// @route   POST /api/emails/gmail-poll
// @desc    Manually trigger Gmail polling for new emails
// @access  Private (for testing/manual trigger)
router.post('/gmail-poll', protect, pollGmail);

module.exports = router;
