const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialize();
    }

    /**
     * Initialize email transporter
     */
    initialize() {
        // Use Nodemailer with Gmail or custom SMTP
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        console.log('✅ Email service initialized');
    }

    /**
     * Send lead notification email
     */
    async sendLeadNotification(ownerEmail, lead, property) {
        const dealTypeLabels = {
            purchase: '🏠 Purchase Inquiry',
            rental: '🔑 Rental Inquiry',
            viewing: '👁️ Viewing Request'
        };

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .label { font-weight: bold; color: #667eea; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 New Lead Captured!</h1>
            <p>${dealTypeLabels[lead.dealType] || 'New Lead'}</p>
        </div>
        <div class="content">
            <div class="card">
                <h2>Property Details</h2>
                <p><span class="label">Property:</span> ${property.title}</p>
                <p><span class="label">Location:</span> ${property.location}</p>
                <p><span class="label">Price:</span> ${property.price}</p>
            </div>
            
            <div class="card">
                <h2>Client Information</h2>
                <p><span class="label">Name:</span> ${lead.client.name}</p>
                <p><span class="label">Email:</span> ${lead.client.email}</p>
                <p><span class="label">Phone:</span> ${lead.client.contact}</p>
                ${lead.client.whatsapp ? `<p><span class="label">WhatsApp:</span> ${lead.client.whatsapp}</p>` : ''}
                ${lead.client.address ? `<p><span class="label">Address:</span> ${lead.client.address}</p>` : ''}
            </div>

            <div class="card">
                <h2>Next Steps</h2>
                <p>Contact the client as soon as possible to discuss their interest and schedule a viewing if needed.</p>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View in Dashboard</a>
            </div>
        </div>
        <div class="footer">
            <p>MyGF AI - Your Smart Real Estate Assistant</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MyGF AI" <${process.env.SMTP_USER}>`,
                to: ownerEmail,
                subject: `New ${dealTypeLabels[lead.dealType]} - ${property.title}`,
                html: emailHtml
            });

            console.log(`✅ Email sent to ${ownerEmail} for lead ${lead._id}`);
            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(userEmail, userName) {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👋 Welcome to MyGF AI!</h1>
            <p>Your Smart Real Estate Assistant</p>
        </div>
        <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Thank you for joining MyGF AI. We're excited to help you revolutionize your real estate business with AI-powered tools.</p>
            
            <h3>What you can do:</h3>
            <div class="feature">✨ AI-powered property search and recommendations</div>
            <div class="feature">📊 Real-time analytics and insights</div>
            <div class="feature">💬 Automated client conversations</div>
            <div class="feature">📱 WhatsApp and email notifications</div>
            <div class="feature">🎯 Lead capture and management</div>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
        </div>
    </div>
</body>
</html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MyGF AI" <${process.env.SMTP_USER}>`,
                to: userEmail,
                subject: 'Welcome to MyGF AI! 🎉',
                html: emailHtml
            });

            console.log(`✅ Welcome email sent to ${userEmail}`);
            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send property published notification
     */
    async sendPropertyPublishedEmail(ownerEmail, property) {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Property Published!</h1>
        </div>
        <div class="content">
            <div class="card">
                <h2>${property.title}</h2>
                <p><strong>Location:</strong> ${property.location}</p>
                <p><strong>Price:</strong> ${property.price}</p>
                <p>Your property is now live and visible to potential clients!</p>
                <a href="${process.env.FRONTEND_URL}/property/${property._id}" class="button">View Property</a>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"MyGF AI" <${process.env.SMTP_USER}>`,
                to: ownerEmail,
                subject: `Property Published: ${property.title}`,
                html: emailHtml
            });

            console.log(`✅ Property published email sent to ${ownerEmail}`);
            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
module.exports = new EmailService();
