const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    // For development: Use console logging (Ethereal Email for testing)
    // For production: Configure with real SMTP credentials

    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
        // Production email configuration
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
    } else {
        // Development: Log emails to console
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER || 'test@example.com',
                pass: process.env.EMAIL_PASSWORD || 'testpassword'
            },
            // For development, we'll just log the email
            streamTransport: true,
            newline: 'unix',
            buffer: true,
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
        });
    }
};

// Send email function
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'MyGF AI <noreply@mygf.ai>',
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        // In development, log the email content
        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Email sent (Development Mode):');
            console.log('To:', options.email);
            console.log('Subject:', options.subject);
            console.log('Content:', options.html);
            console.log('Message ID:', info.messageId);
        }

        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
