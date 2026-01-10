const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

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

        if (isSmtpConfigured) {
            // Create transporter with SMTP
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Send email
            await transporter.sendMail({
                from: `"MyGF AI Platform" <${process.env.SMTP_USER}>`,
                to: to,
                replyTo: senderEmail,
                subject: subject,
                text: `From: ${senderName} (${senderEmail})\n${senderPhone ? `Phone: ${senderPhone}\n` : ''}\n\n${message}`,
                html: emailHTML,
            });

            res.status(200).json({
                success: true,
                message: 'Email sent successfully'
            });
        } else {
            // SMTP not configured - log the email instead
            console.log('📧 EMAIL (SMTP NOT CONFIGURED):', {
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
                message: 'Email logged successfully (SMTP not configured)',
                note: 'Configure SMTP environment variables to send real emails'
            });
        }
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500);
        throw new Error('Failed to send email. Please try again later.');
    }
});
