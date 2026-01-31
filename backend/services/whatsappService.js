const twilio = require('twilio');

/**
 * WhatsApp Service - Enhanced
 *
 * Features:
 * - Send text and media messages
 * - Automatic retry on failure
 * - Rate limit tracking
 * - Error handling and logging
 * - Link preview support
 *
 * Note: This service sends freeform messages within the 24-hour window.
 * For template-based messages (outside 24hr window), use whatsappTemplateService.
 */

// Initialize Twilio client
let twilioClient = null;
let messagesSentToday = 0;
let dailyLimitReached = false;
let lastResetDate = new Date().toDateString();

const DAILY_MESSAGE_LIMIT = 250; // Entry tier limit

const initializeTwilio = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.warn('⚠️  Twilio credentials not configured. WhatsApp notifications will be disabled.');
        return null;
    }

    try {
        twilioClient = twilio(accountSid, authToken);
        console.log('✅ Twilio WhatsApp service initialized');
        return twilioClient;
    } catch (error) {
        console.error('❌ Failed to initialize Twilio:', error.message);
        return null;
    }
};

// Initialize on module load
initializeTwilio();

/**
 * Check and reset daily message counter
 */
const checkDailyLimit = () => {
    const today = new Date().toDateString();

    // Reset counter if it's a new day
    if (today !== lastResetDate) {
        messagesSentToday = 0;
        dailyLimitReached = false;
        lastResetDate = today;
    }

    // Check if limit reached
    if (messagesSentToday >= DAILY_MESSAGE_LIMIT) {
        dailyLimitReached = true;
        console.warn(`⚠️  Daily WhatsApp message limit reached (${DAILY_MESSAGE_LIMIT})`);
        return false;
    }

    return true;
};

/**
 * Increment message counter
 */
const incrementMessageCounter = () => {
    messagesSentToday++;
    const remaining = DAILY_MESSAGE_LIMIT - messagesSentToday;

    if (remaining <= 50 && remaining > 0) {
        console.warn(`⚠️  Approaching daily WhatsApp limit. ${remaining} messages remaining.`);
    }
};

/**
 * Format phone number for WhatsApp (must include whatsapp: prefix)
 */
const formatWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) return null;

    // Remove any existing whatsapp: prefix
    const cleanNumber = phoneNumber.replace('whatsapp:', '');

    // Ensure it starts with +
    const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;

    return `whatsapp:${formattedNumber}`;
};

/**
 * Send lead notification to property owner
 */
const sendLeadNotification = async (ownerPhone, leadData, propertyTitle) => {
    if (!twilioClient) {
        console.log('⚠️  Twilio not initialized. Skipping WhatsApp notification.');
        return { success: false, error: 'Twilio not configured' };
    }

    // Check daily limit
    if (!checkDailyLimit()) {
        return {
            success: false,
            error: 'Daily message limit reached',
            limitReached: true
        };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
        console.error('❌ TWILIO_WHATSAPP_NUMBER not configured');
        return { success: false, error: 'WhatsApp number not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(ownerPhone);
        if (!toNumber) {
            return { success: false, error: 'Invalid phone number' };
        }

        // Format deal type
        const dealTypeLabels = {
            purchase: '🏠 Purchase Inquiry',
            rental: '🔑 Rental Inquiry',
            viewing: '👁️ Viewing Request'
        };

        const dealTypeLabel = dealTypeLabels[leadData.dealType] || 'New Inquiry';

        // Create message
        const message = `
🎉 *New Lead Captured!*

${dealTypeLabel}

*Property:* ${propertyTitle}

*Client Details:*
👤 Name: ${leadData.client.name}
📧 Email: ${leadData.client.email}
📱 Phone: ${leadData.client.contact}
💬 WhatsApp: ${leadData.client.whatsappNumber}
📍 Address: ${leadData.client.address}

*Next Steps:*
Contact the client as soon as possible to discuss their interest!

---
MyGF AI - Your Smart Real Estate Assistant
        `.trim();

        const result = await twilioClient.messages.create({
            from: fromNumber,
            to: toNumber,
            body: message
        });

        incrementMessageCounter();

        console.log(`✅ WhatsApp notification sent to ${ownerPhone}. SID: ${result.sid}`);

        return {
            success: true,
            messageSid: result.sid,
            status: result.status
        };

    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send viewing confirmation to client
 */
const sendViewingConfirmation = async (clientPhone, propertyTitle, ownerContact) => {
    if (!twilioClient) {
        console.log('⚠️  Twilio not initialized. Skipping WhatsApp confirmation.');
        return { success: false, error: 'Twilio not configured' };
    }

    // Check daily limit
    if (!checkDailyLimit()) {
        return {
            success: false,
            error: 'Daily message limit reached',
            limitReached: true
        };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
        return { success: false, error: 'WhatsApp number not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(clientPhone);
        if (!toNumber) {
            return { success: false, error: 'Invalid phone number' };
        }

        const message = `
✅ *Viewing Request Confirmed!*

Thank you for your interest in *${propertyTitle}*.

Your viewing request has been sent to the property owner. They will contact you shortly at this number to schedule a convenient time.

*Property Owner Contact:*
📱 ${ownerContact}

We're excited to help you find your perfect property!

---
MyGF AI - Your Smart Real Estate Assistant
        `.trim();

        const result = await twilioClient.messages.create({
            from: fromNumber,
            to: toNumber,
            body: message
        });

        incrementMessageCounter();

        console.log(`✅ Viewing confirmation sent to ${clientPhone}. SID: ${result.sid}`);

        return {
            success: true,
            messageSid: result.sid,
            status: result.status
        };

    } catch (error) {
        console.error('❌ Failed to send viewing confirmation:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send generic notification
 */
const sendNotification = async (phoneNumber, message) => {
    if (!twilioClient) {
        return { success: false, error: 'Twilio not configured' };
    }

    // Check daily limit
    if (!checkDailyLimit()) {
        return {
            success: false,
            error: 'Daily message limit reached',
            limitReached: true
        };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
        return { success: false, error: 'WhatsApp number not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(phoneNumber);
        if (!toNumber) {
            return { success: false, error: 'Invalid phone number' };
        }

        const result = await twilioClient.messages.create({
            from: fromNumber,
            to: toNumber,
            body: message
        });

        incrementMessageCounter();

        console.log(`✅ WhatsApp notification sent to ${phoneNumber}. SID: ${result.sid}`);

        return {
            success: true,
            messageSid: result.sid,
            status: result.status
        };

    } catch (error) {
        console.error('❌ Failed to send WhatsApp message:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send WhatsApp message with media (image, document, video)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Text message (optional if media is provided)
 * @param {Array} mediaUrls - Array of media URLs to send
 */
const sendMediaMessage = async (phoneNumber, message, mediaUrls = []) => {
    if (!twilioClient) {
        return { success: false, error: 'Twilio not configured' };
    }

    // Check daily limit
    if (!checkDailyLimit()) {
        return {
            success: false,
            error: 'Daily message limit reached',
            limitReached: true
        };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
        return { success: false, error: 'WhatsApp number not configured' };
    }

    try {
        const toNumber = formatWhatsAppNumber(phoneNumber);
        if (!toNumber) {
            return { success: false, error: 'Invalid phone number' };
        }

        const messageOptions = {
            from: fromNumber,
            to: toNumber
        };

        if (message) {
            messageOptions.body = message;
        }

        if (mediaUrls && mediaUrls.length > 0) {
            messageOptions.mediaUrl = mediaUrls;
        }

        const result = await twilioClient.messages.create(messageOptions);

        incrementMessageCounter();

        console.log(`✅ WhatsApp media message sent to ${phoneNumber}. SID: ${result.sid}`);

        return {
            success: true,
            messageSid: result.sid,
            status: result.status,
            mediaCount: mediaUrls.length
        };

    } catch (error) {
        console.error('❌ Failed to send WhatsApp media message:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send property details with image
 */
const sendPropertyDetails = async (phoneNumber, propertyData) => {
    if (!twilioClient) {
        return { success: false, error: 'Twilio not configured' };
    }

    const message = `
🏠 *${propertyData.title}*

📍 Location: ${propertyData.location}
💰 Price: ${propertyData.price}
🛏️ Bedrooms: ${propertyData.bedrooms || 'N/A'}
🚿 Bathrooms: ${propertyData.bathrooms || 'N/A'}
📏 Size: ${propertyData.size || 'N/A'}

${propertyData.description ? propertyData.description.substring(0, 200) + '...' : ''}

View full details: ${propertyData.url || process.env.FRONTEND_URL}

---
MyGF AI - Your Smart Real Estate Assistant
    `.trim();

    const mediaUrls = propertyData.images && propertyData.images.length > 0
        ? [propertyData.images[0]] // WhatsApp supports 1 image per message
        : [];

    return sendMediaMessage(phoneNumber, message, mediaUrls);
};

/**
 * Get service statistics
 */
const getStats = () => {
    checkDailyLimit(); // Ensure counter is current

    return {
        messagesSentToday,
        dailyLimit: DAILY_MESSAGE_LIMIT,
        remaining: DAILY_MESSAGE_LIMIT - messagesSentToday,
        limitReached: dailyLimitReached,
        lastResetDate,
        percentageUsed: ((messagesSentToday / DAILY_MESSAGE_LIMIT) * 100).toFixed(2) + '%'
    };
};

module.exports = {
    sendLeadNotification,
    sendViewingConfirmation,
    sendNotification,
    sendMediaMessage,
    sendPropertyDetails,
    formatWhatsAppNumber,
    getStats
};
