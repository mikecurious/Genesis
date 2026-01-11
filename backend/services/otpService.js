const twilioService = require('./twilioService');

/**
 * OTP Service for generating and sending verification codes
 */
class OTPService {
    constructor() {
        // Store OTPs in memory (in production, use Redis or database)
        this.otpStore = new Map();
        this.otpExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generate a random 6-digit OTP
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP via SMS
     */
    async sendOTP({ phone, purpose = 'verification' }) {
        try {
            // Generate OTP
            const otp = this.generateOTP();
            const expiryTime = Date.now() + this.otpExpiry;

            // Store OTP with expiry
            this.otpStore.set(phone, {
                otp,
                expiryTime,
                attempts: 0,
                createdAt: Date.now()
            });

            // Create message
            const message = `Your MyGF AI verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this message.`;

            // Send via Twilio
            const result = await twilioService.sendSMS({
                to: phone,
                message
            });

            if (result.success) {
                console.log(`✅ OTP sent to ${phone}: ${otp} (Expires in 5 min)`);
                return {
                    success: true,
                    message: 'OTP sent successfully',
                    expiresIn: '5 minutes',
                    // In production, don't return the OTP!
                    // Only for testing:
                    otp: process.env.NODE_ENV === 'development' ? otp : undefined
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to send OTP'
                };
            }
        } catch (error) {
            console.error('❌ OTP send error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify OTP
     */
    verifyOTP({ phone, otp }) {
        const stored = this.otpStore.get(phone);

        if (!stored) {
            return {
                success: false,
                error: 'No OTP found for this number. Please request a new one.'
            };
        }

        // Check if expired
        if (Date.now() > stored.expiryTime) {
            this.otpStore.delete(phone);
            return {
                success: false,
                error: 'OTP has expired. Please request a new one.'
            };
        }

        // Check attempts (max 3)
        if (stored.attempts >= 3) {
            this.otpStore.delete(phone);
            return {
                success: false,
                error: 'Too many failed attempts. Please request a new OTP.'
            };
        }

        // Verify OTP
        if (stored.otp === otp.toString()) {
            this.otpStore.delete(phone);
            console.log(`✅ OTP verified for ${phone}`);
            return {
                success: true,
                message: 'OTP verified successfully'
            };
        } else {
            // Increment failed attempts
            stored.attempts += 1;
            this.otpStore.set(phone, stored);

            return {
                success: false,
                error: `Invalid OTP. ${3 - stored.attempts} attempts remaining.`
            };
        }
    }

    /**
     * Resend OTP
     */
    async resendOTP({ phone }) {
        // Delete old OTP
        this.otpStore.delete(phone);

        // Send new OTP
        return this.sendOTP({ phone });
    }

    /**
     * Send OTP via WhatsApp
     */
    async sendOTPWhatsApp({ phone, purpose = 'verification' }) {
        try {
            const otp = this.generateOTP();
            const expiryTime = Date.now() + this.otpExpiry;

            this.otpStore.set(phone, {
                otp,
                expiryTime,
                attempts: 0,
                createdAt: Date.now()
            });

            const message = `🔐 *MyGF AI Verification*\n\nYour verification code is:\n\n*${otp}*\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this message.`;

            const result = await twilioService.sendWhatsApp({
                to: phone,
                message
            });

            if (result.success) {
                console.log(`✅ OTP sent via WhatsApp to ${phone}: ${otp}`);
                return {
                    success: true,
                    message: 'OTP sent successfully via WhatsApp',
                    expiresIn: '5 minutes',
                    otp: process.env.NODE_ENV === 'development' ? otp : undefined
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Failed to send OTP via WhatsApp'
                };
            }
        } catch (error) {
            console.error('❌ WhatsApp OTP send error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send OTP via multi-channel (tries WhatsApp, falls back to SMS)
     */
    async sendOTPMultiChannel({ phone, email }) {
        // Try WhatsApp first
        if (phone) {
            const whatsappResult = await this.sendOTPWhatsApp({ phone });
            if (whatsappResult.success) {
                return { ...whatsappResult, channel: 'whatsapp' };
            }
        }

        // Fall back to SMS
        if (phone) {
            const smsResult = await this.sendOTP({ phone });
            if (smsResult.success) {
                return { ...smsResult, channel: 'sms' };
            }
        }

        // If both failed
        return {
            success: false,
            error: 'Failed to send OTP via all channels'
        };
    }

    /**
     * Clean up expired OTPs (run periodically)
     */
    cleanupExpiredOTPs() {
        const now = Date.now();
        for (const [phone, data] of this.otpStore.entries()) {
            if (now > data.expiryTime) {
                this.otpStore.delete(phone);
                console.log(`🧹 Cleaned up expired OTP for ${phone}`);
            }
        }
    }
}

// Run cleanup every minute
const otpService = new OTPService();
setInterval(() => otpService.cleanupExpiredOTPs(), 60000);

module.exports = otpService;
