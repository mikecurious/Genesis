const celcomAfricaService = require('../services/celcomAfricaService');
const notificationService = require('../services/notificationService');

/**
 * SMS Helper Utility
 *
 * Provides simple, reusable functions for common SMS patterns:
 * - OTP generation and sending
 * - Quick alerts
 * - Templated messages
 * - Common notifications
 *
 * This is a high-level abstraction over the notification service
 * for easy use throughout the application.
 */

/**
 * Generate a random numeric code
 */
function generateCode(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Generate a random alphanumeric code
 */
function generateAlphanumericCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding ambiguous characters
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Quick SMS - Send a simple SMS without any formatting
 */
async function sendQuickSMS(phone, message) {
    return await celcomAfricaService.sendSMS({
        to: phone,
        message
    });
}

/**
 * Send OTP - Generate and send a verification code
 */
async function sendOTP(phone, options = {}) {
    const {
        length = 6,
        purpose = 'verification',
        expiryMinutes = 5,
        appName = 'My Genesis Fortune'
    } = options;

    const otp = generateCode(length);
    const message = `Your ${appName} verification code is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this message.`;

    const result = await celcomAfricaService.sendSMS({
        to: phone,
        message
    });

    return {
        ...result,
        otp: result.success ? otp : null
    };
}

/**
 * Send Transaction OTP - Specialized OTP for financial transactions
 */
async function sendTransactionOTP(phone, options = {}) {
    const {
        amount,
        transactionType = 'transaction',
        expiryMinutes = 3
    } = options;

    const otp = generateCode(6);
    let message = `🔐 Security Code\n\nYour My Genesis Fortune ${transactionType} verification code is: ${otp}\n\n`;

    if (amount) {
        message += `Amount: KES ${amount}\n\n`;
    }

    message += `This code will expire in ${expiryMinutes} minutes.\n\nNever share this code with anyone!`;

    const result = await celcomAfricaService.sendSMS({
        to: phone,
        message
    });

    return {
        ...result,
        otp: result.success ? otp : null
    };
}

/**
 * Send Welcome SMS - New user welcome message
 */
async function sendWelcomeSMS(phone, userName) {
    const message = `Welcome to My Genesis Fortune, ${userName}! 🎉\n\nWe're excited to have you on board. Start exploring amazing properties and features today!\n\nNeed help? Reply to this message or visit our help center.\n\n- My Genesis Fortune Team`;

    return await celcomAfricaService.sendSMS({
        to: phone,
        message
    });
}

/**
 * Send Alert - Quick system alert
 */
async function sendAlert(phone, alertMessage, priority = 'normal') {
    return await notificationService.sendSystemAlert({
        to: phone,
        message: alertMessage,
        priority
    });
}

/**
 * Send Payment Notification
 */
async function sendPaymentNotification(phone, paymentData) {
    const {
        amount,
        transactionId,
        paymentMethod = 'M-Pesa',
        status = 'confirmed'
    } = paymentData;

    if (status === 'confirmed') {
        return await notificationService.sendPaymentConfirmation({
            to: phone,
            amount,
            transactionId,
            paymentMethod
        });
    } else if (status === 'pending') {
        const message = `⏳ Payment Processing\n\nAmount: KES ${amount}\nTransaction ID: ${transactionId}\n\nWe'll notify you once confirmed.\n\n- My Genesis Fortune`;
        return await celcomAfricaService.sendSMS({ to: phone, message });
    } else if (status === 'failed') {
        const message = `❌ Payment Failed\n\nAmount: KES ${amount}\nTransaction ID: ${transactionId}\n\nPlease try again or contact support.\n\n- My Genesis Fortune`;
        return await celcomAfricaService.sendSMS({ to: phone, message });
    }
}

/**
 * Send Booking Notification
 */
async function sendBookingNotification(phone, bookingData) {
    const {
        propertyTitle,
        checkIn,
        checkOut,
        bookingId,
        status = 'confirmed'
    } = bookingData;

    if (status === 'confirmed') {
        return await notificationService.sendBookingConfirmation({
            to: phone,
            propertyTitle,
            checkIn,
            checkOut,
            bookingId
        });
    } else if (status === 'pending') {
        const message = `⏳ Booking Request Submitted\n\nProperty: ${propertyTitle}\nBooking ID: ${bookingId}\n\nWe'll notify you once confirmed.\n\n- My Genesis Fortune`;
        return await celcomAfricaService.sendSMS({ to: phone, message });
    } else if (status === 'cancelled') {
        const message = `❌ Booking Cancelled\n\nProperty: ${propertyTitle}\nBooking ID: ${bookingId}\n\nYour refund will be processed within 3-5 business days.\n\n- My Genesis Fortune`;
        return await celcomAfricaService.sendSMS({ to: phone, message });
    }
}

/**
 * Send Security Alert
 */
async function sendSecurityAlert(phone, alertType, details) {
    return await notificationService.sendSecurityAlert({
        to: phone,
        alertType,
        details
    });
}

/**
 * Send Reminder
 */
async function sendReminder(phone, reminderText) {
    const message = `⏰ Reminder\n\n${reminderText}\n\n- My Genesis Fortune`;
    return await celcomAfricaService.sendSMS({
        to: phone,
        message
    });
}

/**
 * Send Bulk SMS to multiple recipients
 */
async function sendBulkSMS(phoneNumbers, message) {
    return await celcomAfricaService.sendSMS({
        to: phoneNumbers,
        message
    });
}

/**
 * Format phone number to standard format
 */
function formatPhone(phone) {
    return celcomAfricaService.formatPhoneNumber(phone);
}

/**
 * Validate phone number format
 */
function isValidPhone(phone) {
    if (!phone) return false;

    const formatted = formatPhone(phone);

    // Check if it's a valid Kenyan number (254XXXXXXXXX, 10 digits total)
    return formatted && formatted.startsWith('254') && formatted.length === 12;
}

/**
 * Template message builder
 */
function buildMessage(template, variables) {
    let message = template;

    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, variables[key]);
    });

    return message;
}

/**
 * Common message templates
 */
const templates = {
    otp: 'Your {{appName}} verification code is: {{code}}\n\nThis code will expire in {{expiry}} minutes.',

    welcome: 'Welcome to {{appName}}, {{userName}}! We are excited to have you on board!',

    payment_success: 'Payment Confirmed!\n\nAmount: KES {{amount}}\nTransaction ID: {{transactionId}}\n\nThank you!',

    booking_confirmed: 'Booking Confirmed!\n\nProperty: {{propertyTitle}}\nCheck-in: {{checkIn}}\nBooking ID: {{bookingId}}',

    subscription_active: 'Subscription Activated!\n\nPlan: {{plan}}\nExpires: {{expiresAt}}\n\nThank you for subscribing!',

    security_alert: 'Security Alert\n\n{{alertMessage}}\n\nIf this was not you, secure your account immediately!',

    reminder: 'Reminder\n\n{{reminderText}}'
};

/**
 * Send templated message
 */
async function sendTemplatedMessage(phone, templateName, variables) {
    const template = templates[templateName];

    if (!template) {
        throw new Error(`Template "${templateName}" not found`);
    }

    const message = buildMessage(template, variables);

    return await celcomAfricaService.sendSMS({
        to: phone,
        message: message + '\n\n- My Genesis Fortune'
    });
}

// Export all helper functions
module.exports = {
    // Code generation
    generateCode,
    generateAlphanumericCode,

    // Basic SMS
    sendQuickSMS,
    sendBulkSMS,

    // OTP functions
    sendOTP,
    sendTransactionOTP,

    // Common notifications
    sendWelcomeSMS,
    sendAlert,
    sendPaymentNotification,
    sendBookingNotification,
    sendSecurityAlert,
    sendReminder,

    // Phone utilities
    formatPhone,
    isValidPhone,

    // Template functions
    buildMessage,
    sendTemplatedMessage,
    templates
};
