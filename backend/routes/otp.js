const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');

/**
 * Send OTP via SMS
 * @route POST /api/otp/send
 * @access Public
 */
router.post('/send', async (req, res) => {
    try {
        const { phone, channel = 'sms' } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        let result;

        switch (channel) {
            case 'sms':
                result = await otpService.sendOTP({ phone });
                break;
            case 'whatsapp':
                result = await otpService.sendOTPWhatsApp({ phone });
                break;
            case 'multi':
                result = await otpService.sendOTPMultiChannel({ phone });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid channel. Use: sms, whatsapp, or multi'
                });
        }

        res.json(result);
    } catch (error) {
        console.error('OTP send error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Verify OTP
 * @route POST /api/otp/verify
 * @access Public
 */
router.post('/verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and OTP are required'
            });
        }

        const result = otpService.verifyOTP({ phone, otp });

        res.json(result);
    } catch (error) {
        console.error('OTP verify error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Resend OTP
 * @route POST /api/otp/resend
 * @access Public
 */
router.post('/resend', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const result = await otpService.resendOTP({ phone });

        res.json(result);
    } catch (error) {
        console.error('OTP resend error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
