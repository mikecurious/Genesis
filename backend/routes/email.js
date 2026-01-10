const express = require('express');
const { sendEmail } = require('../controllers/email');

const router = express.Router();

// @route   POST /api/emails/send
// @desc    Send email through the platform
// @access  Public
router.post('/send', sendEmail);

module.exports = router;
