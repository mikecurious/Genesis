const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

/**
 * Comprehensive Twilio Service for SMS, WhatsApp, Voice, and Email (SendGrid)
 *
 * Required Environment Variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER (for SMS)
 * - TWILIO_WHATSAPP_NUMBER (for WhatsApp)
 * - SENDGRID_API_KEY (for Email via SendGrid)
 * - SENDGRID_FROM_EMAIL (verified sender email)
 */

class TwilioService {
    constructor() {
        this.twilioClient = null;
        this.isInitialized = false;
        this.sendGridConfigured = false;

        this.initialize();
    }

    /**
     * Initialize Twilio and SendGrid clients
     */
    initialize() {
        try {
            // Initialize Twilio
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;

            if (accountSid && authToken) {
                this.twilioClient = twilio(accountSid, authToken);
                this.isInitialized = true;
                console.log('✅ Twilio service initialized');
            } else {
                console.warn('⚠️  Twilio credentials not configured');
            }

            // Initialize SendGrid
            const sendGridApiKey = process.env.SENDGRID_API_KEY;
            if (sendGridApiKey) {
                sgMail.setApiKey(sendGridApiKey);
                this.sendGridConfigured = true;
                console.log('✅ SendGrid (Twilio Email) initialized');
            } else {
                console.warn('⚠️  SendGrid API key not configured');
            }
        } catch (error) {
            console.error('❌ Twilio initialization error:', error.message);
        }
    }

    /**
     * Check if Twilio is configured
     */
    isConfigured() {
        return this.isInitialized && this.twilioClient !== null;
    }

    /**
     * Format phone number for WhatsApp (adds whatsapp: prefix)
     */
    formatWhatsAppNumber(phoneNumber) {
        if (!phoneNumber) return null;
        const cleanNumber = phoneNumber.replace('whatsapp:', '').trim();
        const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
        return `whatsapp:${formattedNumber}`;
    }

    /**
     * Format phone number for SMS (ensures + prefix)
     */
    formatSMSNumber(phoneNumber) {
        if (!phoneNumber) return null;
        const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
        return cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
    }

    /**
     * Send SMS message
     */
    async sendSMS({ to, message, from }) {
        if (!this.isConfigured()) {
            console.log('📱 SMS not sent: Twilio not configured');
            return { success: false, error: 'Twilio not configured' };
        }

        const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
        if (!fromNumber) {
            return { success: false, error: 'SMS sender number not configured' };
        }

        try {
            const toNumber = this.formatSMSNumber(to);
            if (!toNumber) {
                return { success: false, error: 'Invalid phone number' };
            }

            const result = await this.twilioClient.messages.create({
                from: fromNumber,
                to: toNumber,
                body: message
            });

            console.log(`✅ SMS sent to ${to}. SID: ${result.sid}`);
            return {
                success: true,
                messageSid: result.sid,
                status: result.status,
                channel: 'sms'
            };
        } catch (error) {
            console.error(`❌ SMS send failed to ${to}:`, error.message);
            return {
                success: false,
                error: error.message,
                channel: 'sms'
            };
        }
    }

    /**
     * Send WhatsApp message
     */
    async sendWhatsApp({ to, message, from }) {
        if (!this.isConfigured()) {
            console.log('💬 WhatsApp not sent: Twilio not configured');
            return { success: false, error: 'Twilio not configured' };
        }

        const fromNumber = from || process.env.TWILIO_WHATSAPP_NUMBER;
        if (!fromNumber) {
            return { success: false, error: 'WhatsApp sender number not configured' };
        }

        try {
            const toNumber = this.formatWhatsAppNumber(to);
            if (!toNumber) {
                return { success: false, error: 'Invalid phone number' };
            }

            const result = await this.twilioClient.messages.create({
                from: fromNumber,
                to: toNumber,
                body: message
            });

            console.log(`✅ WhatsApp sent to ${to}. SID: ${result.sid}`);
            return {
                success: true,
                messageSid: result.sid,
                status: result.status,
                channel: 'whatsapp'
            };
        } catch (error) {
            console.error(`❌ WhatsApp send failed to ${to}:`, error.message);
            return {
                success: false,
                error: error.message,
                channel: 'whatsapp'
            };
        }
    }

    /**
     * Send email via SendGrid (Twilio's email service)
     */
    async sendEmail({ to, subject, text, html, from, replyTo, cc, bcc, attachments }) {
        if (!this.sendGridConfigured) {
            console.log('📧 Email not sent: SendGrid not configured');
            return { success: false, error: 'SendGrid not configured' };
        }

        try {
            const fromEmail = from || process.env.SENDGRID_FROM_EMAIL;
            if (!fromEmail) {
                return { success: false, error: 'Sender email not configured' };
            }

            const msg = {
                to,
                from: fromEmail,
                subject,
                text,
                html,
                replyTo,
                cc,
                bcc,
                attachments
            };

            const result = await sgMail.send(msg);

            console.log(`✅ Email sent to ${to}. Status: ${result[0].statusCode}`);
            return {
                success: true,
                statusCode: result[0].statusCode,
                messageId: result[0].headers['x-message-id'],
                channel: 'email'
            };
        } catch (error) {
            console.error(`❌ Email send failed to ${to}:`, error.message);
            return {
                success: false,
                error: error.message,
                channel: 'email'
            };
        }
    }

    /**
     * Send multi-channel notification (tries WhatsApp, falls back to SMS, then Email)
     */
    async sendMultiChannelNotification({ phone, email, message, subject, htmlEmail }) {
        const results = {
            whatsapp: null,
            sms: null,
            email: null,
            success: false
        };

        // Try WhatsApp first
        if (phone) {
            results.whatsapp = await this.sendWhatsApp({ to: phone, message });
            if (results.whatsapp.success) {
                results.success = true;
                return results;
            }
        }

        // Fall back to SMS if WhatsApp failed
        if (phone) {
            results.sms = await this.sendSMS({ to: phone, message });
            if (results.sms.success) {
                results.success = true;
                return results;
            }
        }

        // Fall back to Email if SMS failed
        if (email) {
            results.email = await this.sendEmail({
                to: email,
                subject: subject || 'Notification from MyGF AI',
                text: message,
                html: htmlEmail || `<p>${message.replace(/\n/g, '<br>')}</p>`
            });
            if (results.email.success) {
                results.success = true;
            }
        }

        return results;
    }

    /**
     * Send lead notification to property owner/agent
     */
    async sendLeadNotification({ ownerPhone, ownerEmail, ownerName, leadData, propertyTitle, propertyLocation, propertyPrice }) {
        const dealTypeLabels = {
            purchase: '🏠 Purchase Inquiry',
            rental: '🔑 Rental Inquiry',
            viewing: '👁️ Viewing Request'
        };

        const dealTypeLabel = dealTypeLabels[leadData.dealType] || 'New Inquiry';

        // SMS/WhatsApp Message
        const message = `
🎉 *New Lead Captured!*

${dealTypeLabel}

*Property:* ${propertyTitle}
*Location:* ${propertyLocation}
*Price:* ${propertyPrice}

*Client Details:*
👤 Name: ${leadData.client.name}
📧 Email: ${leadData.client.email}
📱 Phone: ${leadData.client.contact}

Contact the client ASAP!

---
MyGF AI
        `.trim();

        // HTML Email
        const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .label { font-weight: bold; color: #667eea; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 New Lead Captured!</h1>
            <p>${dealTypeLabel}</p>
        </div>
        <div class="content">
            <div class="card">
                <h2>Property Details</h2>
                <p><span class="label">Property:</span> ${propertyTitle}</p>
                <p><span class="label">Location:</span> ${propertyLocation}</p>
                <p><span class="label">Price:</span> ${propertyPrice}</p>
            </div>
            <div class="card">
                <h2>Client Information</h2>
                <p><span class="label">Name:</span> ${leadData.client.name}</p>
                <p><span class="label">Email:</span> ${leadData.client.email}</p>
                <p><span class="label">Phone:</span> ${leadData.client.contact}</p>
            </div>
            <div class="card">
                <h2>Next Steps</h2>
                <p>Contact the client as soon as possible to discuss their interest and schedule a viewing if needed.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendMultiChannelNotification({
            phone: ownerPhone,
            email: ownerEmail,
            message,
            subject: `New ${dealTypeLabel} - ${propertyTitle}`,
            htmlEmail
        });
    }

    /**
     * Send viewing confirmation to client
     */
    async sendViewingConfirmation({ clientPhone, clientEmail, clientName, propertyTitle, viewingDate, agentName, agentPhone }) {
        const message = `
✅ *Viewing Confirmed!*

Hi ${clientName},

Your viewing for *${propertyTitle}* has been confirmed!

*Date & Time:* ${viewingDate}
*Agent:* ${agentName}
*Agent Phone:* ${agentPhone}

The agent will contact you shortly.

---
MyGF AI
        `.trim();

        const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .label { font-weight: bold; color: #10b981; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Viewing Confirmed!</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Hi ${clientName},</p>
                <p>Your viewing for <strong>${propertyTitle}</strong> has been confirmed!</p>
                <p><span class="label">Date & Time:</span> ${viewingDate}</p>
                <p><span class="label">Agent:</span> ${agentName}</p>
                <p><span class="label">Agent Phone:</span> ${agentPhone}</p>
                <p>The agent will contact you shortly to provide directions and answer any questions.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendMultiChannelNotification({
            phone: clientPhone,
            email: clientEmail,
            message,
            subject: `Viewing Confirmed - ${propertyTitle}`,
            htmlEmail
        });
    }

    /**
     * Send rent reminder to tenant
     */
    async sendRentReminder({ tenantPhone, tenantEmail, tenantName, propertyTitle, rentAmount, dueDate, paymentLink }) {
        const message = `
💰 *Rent Reminder*

Hi ${tenantName},

Your rent for *${propertyTitle}* is due on ${dueDate}.

*Amount Due:* KSh ${rentAmount.toLocaleString()}

${paymentLink ? `Pay now: ${paymentLink}` : 'Please make your payment on time.'}

---
MyGF AI
        `.trim();

        const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .amount { font-size: 24px; color: #f59e0b; font-weight: bold; }
        .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Rent Reminder</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Hi ${tenantName},</p>
                <p>Your rent for <strong>${propertyTitle}</strong> is due on <strong>${dueDate}</strong>.</p>
                <p class="amount">KSh ${rentAmount.toLocaleString()}</p>
                ${paymentLink ? `<a href="${paymentLink}" class="button">Pay Now</a>` : '<p>Please make your payment on time.</p>'}
            </div>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendMultiChannelNotification({
            phone: tenantPhone,
            email: tenantEmail,
            message,
            subject: `Rent Reminder - ${propertyTitle}`,
            htmlEmail
        });
    }

    /**
     * Send maintenance update notification
     */
    async sendMaintenanceUpdate({ recipientPhone, recipientEmail, recipientName, propertyTitle, requestType, status, technicianName, estimatedTime }) {
        const statusEmojis = {
            pending: '⏳',
            assigned: '👷',
            'in-progress': '🔧',
            completed: '✅',
            cancelled: '❌'
        };

        const emoji = statusEmojis[status] || '📋';

        const message = `
${emoji} *Maintenance Update*

Hi ${recipientName},

Your maintenance request for *${propertyTitle}* has been updated.

*Request Type:* ${requestType}
*Status:* ${status}
${technicianName ? `*Technician:* ${technicianName}` : ''}
${estimatedTime ? `*Estimated Time:* ${estimatedTime}` : ''}

---
MyGF AI
        `.trim();

        const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${emoji} Maintenance Update</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Hi ${recipientName},</p>
                <p>Your maintenance request for <strong>${propertyTitle}</strong> has been updated.</p>
                <p><strong>Request Type:</strong> ${requestType}</p>
                <p><strong>Status:</strong> <span class="status">${status}</span></p>
                ${technicianName ? `<p><strong>Technician:</strong> ${technicianName}</p>` : ''}
                ${estimatedTime ? `<p><strong>Estimated Time:</strong> ${estimatedTime}</p>` : ''}
            </div>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendMultiChannelNotification({
            phone: recipientPhone,
            email: recipientEmail,
            message,
            subject: `Maintenance Update - ${propertyTitle}`,
            htmlEmail
        });
    }

    /**
     * Get service health status
     */
    getHealthStatus() {
        return {
            twilio: {
                configured: this.isConfigured(),
                smsNumber: process.env.TWILIO_PHONE_NUMBER ? '***configured***' : 'not configured',
                whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER ? '***configured***' : 'not configured'
            },
            sendgrid: {
                configured: this.sendGridConfigured,
                fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not configured'
            }
        };
    }
}

module.exports = new TwilioService();
