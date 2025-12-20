const twilio = require('twilio');

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.warn('Twilio credentials not configured. WhatsApp notifications will be disabled.');
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
        console.log('Twilio not initialized. Skipping WhatsApp notification.');
        return { success: false, error: 'Twilio not configured' };
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
        console.error('TWILIO_WHATSAPP_NUMBER not configured');
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
        console.log('Twilio not initialized. Skipping WhatsApp confirmation.');
        return { success: false, error: 'Twilio not configured' };
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

module.exports = {
    sendLeadNotification,
    sendViewingConfirmation,
    sendNotification,
    formatWhatsAppNumber
};
