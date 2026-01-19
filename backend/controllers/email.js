const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const twilioService = require('../services/twilioService');
const emailInquiryService = require('../services/emailInquiryService');
const gmailService = require('../services/gmailService');

// @desc    Send email through the platform
// @route   POST /api/emails/send
// @access  Public
exports.sendEmail = asyncHandler(async (req, res) => {
    const { to, subject, message, senderName, senderEmail, senderPhone, context } = req.body;

    // Validation
    if (!to || !subject || !message || !senderName || !senderEmail) {
        res.status(400);
        throw new Error('Missing required fields');
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail) || !emailRegex.test(to)) {
        res.status(400);
        throw new Error('Invalid email address');
    }

    // Build email HTML
    let emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #16a34a; margin-bottom: 20px; border-bottom: 3px solid #16a34a; padding-bottom: 10px;">
                    New Message from MyGF AI Platform
                </h2>
    `;

    // Add context information if provided
    if (context) {
        emailHTML += '<div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">';
        emailHTML += '<h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">Message Context:</h3>';

        if (context.propertyTitle) {
            emailHTML += `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Property:</strong> ${context.propertyTitle}</p>`;
        }
        if (context.propertyLocation) {
            emailHTML += `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Location:</strong> ${context.propertyLocation}</p>`;
        }
        if (context.propertyPrice) {
            emailHTML += `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Price:</strong> ${context.propertyPrice}</p>`;
        }
        if (context.surveyorName) {
            emailHTML += `<p style="margin: 5px 0; color: #1e3a8a;"><strong>Surveyor:</strong> ${context.surveyorName}</p>`;
        }

        emailHTML += '</div>';
    }

    // Add sender information
    emailHTML += '<div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">';
    emailHTML += '<h3 style="color: #374151; margin-top: 0; font-size: 16px;">From:</h3>';
    emailHTML += `<p style="margin: 5px 0; color: #4b5563;"><strong>Name:</strong> ${senderName}</p>`;
    emailHTML += `<p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> ${senderEmail}</p>`;
    if (senderPhone) {
        emailHTML += `<p style="margin: 5px 0; color: #4b5563;"><strong>Phone:</strong> ${senderPhone}</p>`;
    }
    emailHTML += '</div>';

    // Add message
    emailHTML += '<div style="margin-bottom: 20px;">';
    emailHTML += '<h3 style="color: #374151; font-size: 16px;">Message:</h3>';
    emailHTML += `<div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a; white-space: pre-wrap; color: #1f2937; line-height: 1.6;">${message}</div>`;
    emailHTML += '</div>';

    // Add footer
    emailHTML += `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>This email was sent through the MyGF AI Real Estate Platform</p>
                    <p style="margin-top: 10px;">
                        <strong>Reply directly to this email to contact the sender:</strong> ${senderEmail}
                    </p>
                </div>
            </div>
        </div>
    `;

    try {
        // Check if SMTP is configured
        const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const isSendGridConfigured = process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL;

        let emailSent = false;
        let method = '';

        // Try SMTP first if configured
        if (isSmtpConfigured) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_PORT === '465',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"MyGF AI Platform" <${process.env.SMTP_USER}>`,
                    to: to,
                    replyTo: senderEmail,
                    subject: subject,
                    text: `From: ${senderName} (${senderEmail})\n${senderPhone ? `Phone: ${senderPhone}\n` : ''}\n\n${message}`,
                    html: emailHTML,
                });

                emailSent = true;
                method = 'SMTP';
            } catch (smtpError) {
                console.error('SMTP failed, trying SendGrid:', smtpError.message);
            }
        }

        // Try SendGrid (Twilio) if SMTP failed or not configured
        if (!emailSent && isSendGridConfigured) {
            const result = await twilioService.sendEmail({
                to,
                subject,
                text: `From: ${senderName} (${senderEmail})\n${senderPhone ? `Phone: ${senderPhone}\n` : ''}\n\n${message}`,
                html: emailHTML,
                replyTo: senderEmail
            });

            if (result.success) {
                emailSent = true;
                method = 'SendGrid (Twilio)';
            }
        }

        if (emailSent) {
            res.status(200).json({
                success: true,
                message: `Email sent successfully via ${method}`
            });
        } else {
            // Neither service configured - log the email
            console.log('📧 EMAIL (NO SERVICE CONFIGURED):', {
                to,
                subject,
                senderName,
                senderEmail,
                senderPhone,
                message,
                context
            });

            res.status(200).json({
                success: true,
                message: 'Email logged successfully (no email service configured)',
                note: 'Configure SMTP or SendGrid to send real emails'
            });
        }
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500);
        throw new Error('Failed to send email. Please try again later.');
    }
});

// @desc    Handle inbound email webhook from SendGrid
// @route   POST /api/emails/inbound-webhook
// @access  Public (webhook)
exports.handleInboundEmailWebhook = asyncHandler(async (req, res) => {
    try {
        console.log('Received inbound email webhook');

        // Parse SendGrid webhook payload
        const emailData = emailInquiryService.parseSendGridInbound(req.body);

        if (!emailData.from || !emailData.subject) {
            res.status(400);
            throw new Error('Invalid webhook payload');
        }

        // Process the inbound email
        const result = await emailInquiryService.handleInboundEmail(emailData);

        if (!result.success) {
            console.error('Failed to process inbound email:', result.error);
            // Still return 200 to SendGrid to avoid retries for unrecoverable errors
            return res.status(200).json({
                success: false,
                message: 'Email received but processing failed',
                error: result.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email processed successfully',
            leadId: result.leadId
        });
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Return 200 to prevent SendGrid from retrying
        res.status(200).json({
            success: false,
            message: 'Webhook received but failed to process',
            error: error.message
        });
    }
});

// @desc    Handle Gmail push notification webhook
// @route   POST /api/emails/gmail-webhook
// @access  Public (webhook)
exports.handleGmailWebhook = asyncHandler(async (req, res) => {
    try {
        console.log('Received Gmail push notification');

        // Gmail sends push notifications via Google Cloud Pub/Sub
        // The notification contains a message ID that we need to fetch
        const notification = req.body;

        if (!notification || !notification.message) {
            res.status(400);
            throw new Error('Invalid Gmail webhook payload');
        }

        // Decode the base64 data
        const data = Buffer.from(notification.message.data, 'base64').toString('utf-8');
        const emailData = JSON.parse(data);

        console.log('Gmail notification data:', emailData);

        // Fetch the actual email using the history ID
        // This is more efficient than fetching all messages
        // We'll process new messages in the next poll cycle

        // Acknowledge receipt immediately to Google
        res.status(200).json({ success: true, message: 'Notification received' });

        // Trigger polling in background (non-blocking)
        setImmediate(async () => {
            try {
                await emailInquiryService.pollGmailForNewEmails();
            } catch (error) {
                console.error('Error processing Gmail webhook:', error);
            }
        });
    } catch (error) {
        console.error('Gmail webhook error:', error);
        // Still return 200 to prevent Google from retrying
        res.status(200).json({
            success: false,
            message: 'Webhook received but processing failed',
            error: error.message
        });
    }
});

// @desc    Manually trigger Gmail polling (for testing)
// @route   POST /api/emails/gmail-poll
// @access  Private (admin only)
exports.pollGmail = asyncHandler(async (req, res) => {
    try {
        console.log('Manual Gmail poll triggered');

        const results = await emailInquiryService.pollGmailForNewEmails();

        res.status(200).json({
            success: true,
            message: `Processed ${results.length} emails`,
            data: results
        });
    } catch (error) {
        console.error('Gmail poll error:', error);
        res.status(500);
        throw new Error('Failed to poll Gmail');
    }
});
