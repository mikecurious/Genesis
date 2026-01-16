const celcomAfricaService = require('./celcomAfricaService');
const twilioService = require('./twilioService');

/**
 * Notification Service
 *
 * Handles sending notifications via multiple channels:
 * - SMS (via Celcom Africa)
 * - WhatsApp (via Twilio)
 * - Email (future implementation)
 *
 * Use cases:
 * - System alerts
 * - Payment confirmations
 * - Subscription updates
 * - Security alerts
 * - General notifications
 */
class NotificationService {
    constructor() {
        console.log('✅ Notification Service initialized');
    }

    /**
     * Send a system alert via SMS
     * Use for critical system events, errors, or important updates
     */
    async sendSystemAlert({ to, message, priority = 'normal' }) {
        try {
            const prefix = priority === 'high' ? '⚠️ ALERT: ' : '📢 ';
            const fullMessage = `${prefix}${message}\n\n- MY GENESIS FORTUNE System`;

            const result = await celcomAfricaService.sendSMS({
                to,
                message: fullMessage
            });

            if (result.success) {
                console.log(`✅ System alert sent to ${to} (Priority: ${priority})`);
            }

            return result;
        } catch (error) {
            console.error('❌ System alert error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send payment confirmation notification
     */
    async sendPaymentConfirmation({ to, amount, transactionId, paymentMethod }) {
        try {
            const message = `✅ Payment Confirmed!\n\nAmount: KES ${amount}\nTransaction ID: ${transactionId}\nMethod: ${paymentMethod}\n\nThank you for your payment!\n\n- MY GENESIS FORTUNE`;

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Payment confirmation sent to ${to}`);
            }

            return result;
        } catch (error) {
            console.error('❌ Payment confirmation error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send subscription update notification
     */
    async sendSubscriptionUpdate({ to, plan, status, expiresAt }) {
        try {
            let message;

            if (status === 'active') {
                message = `🎉 Subscription Activated!\n\nPlan: ${plan}\nExpires: ${new Date(expiresAt).toLocaleDateString()}\n\nThank you for subscribing!\n\n- MY GENESIS FORTUNE`;
            } else if (status === 'expired') {
                message = `⏰ Subscription Expired\n\nYour ${plan} plan has expired. Renew now to continue enjoying premium features!\n\n- MY GENESIS FORTUNE`;
            } else if (status === 'expiring_soon') {
                message = `⏰ Subscription Expiring Soon\n\nYour ${plan} plan expires on ${new Date(expiresAt).toLocaleDateString()}. Renew now to avoid interruption!\n\n- MY GENESIS FORTUNE`;
            } else {
                message = `📢 Subscription Update\n\nPlan: ${plan}\nStatus: ${status}\n\n- MY GENESIS FORTUNE`;
            }

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Subscription update sent to ${to}`);
            }

            return result;
        } catch (error) {
            console.error('❌ Subscription update error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send security alert
     */
    async sendSecurityAlert({ to, alertType, details }) {
        try {
            let message;

            switch (alertType) {
                case 'login':
                    message = `🔐 Security Alert: New Login\n\n${details}\n\nIf this wasn't you, secure your account immediately!\n\n- MY GENESIS FORTUNE Security`;
                    break;
                case 'password_changed':
                    message = `🔐 Security Alert: Password Changed\n\nYour password was recently changed.\n\nIf this wasn't you, contact support immediately!\n\n- MY GENESIS FORTUNE Security`;
                    break;
                case 'suspicious_activity':
                    message = `⚠️ Security Alert: Suspicious Activity\n\n${details}\n\nWe've detected unusual activity on your account. Please review your recent activity.\n\n- MY GENESIS FORTUNE Security`;
                    break;
                case 'account_locked':
                    message = `🔒 Security Alert: Account Locked\n\nYour account has been locked due to ${details}\n\nContact support to unlock your account.\n\n- MY GENESIS FORTUNE Security`;
                    break;
                default:
                    message = `🔐 Security Alert\n\n${details}\n\n- MY GENESIS FORTUNE Security`;
            }

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Security alert sent to ${to} (Type: ${alertType})`);
            }

            return result;
        } catch (error) {
            console.error('❌ Security alert error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send property listing notification
     */
    async sendPropertyNotification({ to, propertyTitle, action, details }) {
        try {
            let message;

            switch (action) {
                case 'approved':
                    message = `✅ Property Approved!\n\n"${propertyTitle}" has been approved and is now live!\n\n${details}\n\n- MY GENESIS FORTUNE`;
                    break;
                case 'rejected':
                    message = `❌ Property Update Required\n\n"${propertyTitle}" needs revision.\n\nReason: ${details}\n\n- MY GENESIS FORTUNE`;
                    break;
                case 'inquiry':
                    message = `📬 New Inquiry\n\nSomeone is interested in "${propertyTitle}"!\n\n${details}\n\nCheck your dashboard for details.\n\n- MY GENESIS FORTUNE`;
                    break;
                case 'booking':
                    message = `🎉 New Booking!\n\nProperty: "${propertyTitle}"\n\n${details}\n\nCheck your dashboard for details.\n\n- MY GENESIS FORTUNE`;
                    break;
                default:
                    message = `📢 Property Update\n\n"${propertyTitle}"\n\n${details}\n\n- MY GENESIS FORTUNE`;
            }

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Property notification sent to ${to} (Action: ${action})`);
            }

            return result;
        } catch (error) {
            console.error('❌ Property notification error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send booking confirmation
     */
    async sendBookingConfirmation({ to, propertyTitle, checkIn, checkOut, bookingId }) {
        try {
            const message = `🎉 Booking Confirmed!\n\nProperty: ${propertyTitle}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nBooking ID: ${bookingId}\n\nHave a great stay!\n\n- MY GENESIS FORTUNE`;

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Booking confirmation sent to ${to}`);
            }

            return result;
        } catch (error) {
            console.error('❌ Booking confirmation error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send reminder notification
     */
    async sendReminder({ to, reminderType, details }) {
        try {
            const message = `⏰ Reminder\n\n${reminderType}:\n${details}\n\n- MY GENESIS FORTUNE`;

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Reminder sent to ${to}`);
            }

            return result;
        } catch (error) {
            console.error('❌ Reminder error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send custom notification
     */
    async sendCustomNotification({ to, message, channel = 'sms' }) {
        try {
            let result;

            if (channel === 'sms') {
                result = await celcomAfricaService.sendSMS({
                    to,
                    message
                });
            } else if (channel === 'whatsapp') {
                result = await twilioService.sendWhatsApp({
                    to,
                    message
                });
            } else {
                return {
                    success: false,
                    error: 'Invalid channel. Use: sms or whatsapp'
                };
            }

            if (result.success) {
                console.log(`✅ Custom notification sent to ${to} via ${channel}`);
            }

            return result;
        } catch (error) {
            console.error('❌ Custom notification error:', error);
            return {
                success: false,
                error: error.message,
                channel
            };
        }
    }

    /**
     * Send bulk notifications
     */
    async sendBulkNotification({ recipients, message, channel = 'sms' }) {
        try {
            if (!Array.isArray(recipients) || recipients.length === 0) {
                return {
                    success: false,
                    error: 'Recipients must be a non-empty array'
                };
            }

            // Celcom Africa supports bulk SMS with comma-separated numbers
            if (channel === 'sms') {
                const result = await celcomAfricaService.sendSMS({
                    to: recipients,
                    message
                });

                if (result.success) {
                    console.log(`✅ Bulk notification sent to ${recipients.length} recipients via SMS`);
                }

                return result;
            } else if (channel === 'whatsapp') {
                // WhatsApp needs individual sends
                const results = await Promise.allSettled(
                    recipients.map(phone =>
                        twilioService.sendWhatsApp({ to: phone, message })
                    )
                );

                const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
                const failed = recipients.length - successful;

                console.log(`✅ Bulk notification sent: ${successful} successful, ${failed} failed`);

                return {
                    success: true,
                    sent: successful,
                    failed: failed,
                    total: recipients.length,
                    channel: 'whatsapp'
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid channel. Use: sms or whatsapp'
                };
            }
        } catch (error) {
            console.error('❌ Bulk notification error:', error);
            return {
                success: false,
                error: error.message,
                channel
            };
        }
    }

    /**
     * Send verification code (OTP)
     */
    async sendVerificationCode({ to, code, purpose = 'verification' }) {
        try {
            const message = `Your My Genesis Fortune verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this message.\n\n- My Genesis Fortune`;

            const result = await celcomAfricaService.sendSMS({
                to,
                message
            });

            if (result.success) {
                console.log(`✅ Verification code sent to ${to}`);
            }

            return result;
        } catch (error) {
            console.error('❌ Verification code error:', error);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Check notification service health
     */
    getHealthStatus() {
        return {
            service: 'Notification Service',
            smsProvider: 'Celcom Africa',
            whatsappProvider: 'Twilio',
            celcomStatus: celcomAfricaService.getHealthStatus(),
            available: true
        };
    }
}

module.exports = new NotificationService();
