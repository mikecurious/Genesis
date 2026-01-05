const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isInitialized = false;
    }

    /**
     * Initialize email transporter
     */
    async initialize() {
        try {
            // Validate required environment variables
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                console.warn('⚠️  Email credentials not configured');
                return;
            }

            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                pool: true, // use pooled connection
                maxConnections: 5,
                maxMessages: 100,
                rateDelta: 1000, // limit to 1 email per second
                rateLimit: 5
            });

            // Verify connection
            await this.transporter.verify();
            this.isInitialized = true;
            console.log('✅ Email service initialized and verified');
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            this.isInitialized = false;
        }
    }

    /**
     * Validate email address format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Send email with retry mechanism
     */
    async sendEmailWithRetry(mailOptions, maxRetries = 3) {
        if (!this.isInitialized || !this.transporter) {
            throw new Error('Email service not initialized');
        }

        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.transporter.sendMail(mailOptions);
                console.log(`✅ Email sent successfully (attempt ${attempt})`);
                return { success: true, result };
            } catch (error) {
                lastError = error;
                console.warn(`⚠️  Email send attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        console.error(`❌ Email failed after ${maxRetries} attempts:`, lastError.message);
        return { success: false, error: lastError.message };
    }

    /**
     * Send lead notification email
     */
    async sendLeadNotification(ownerEmail, lead, property) {
        try {
            // Validate inputs
            if (!this.validateEmail(ownerEmail)) {
                throw new Error('Invalid owner email address');
            }
            if (!lead || !property) {
                throw new Error('Lead and property data are required');
            }
            if (!lead.client || !lead.client.email) {
                throw new Error('Lead client information is incomplete');
            }
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

            const mailOptions = {
                from: process.env.EMAIL_FROM || `"MyGF AI" <${process.env.EMAIL_USER}>`,
                to: ownerEmail,
                subject: `New ${dealTypeLabels[lead.dealType]} - ${property.title}`,
                html: emailHtml
            };

            return await this.sendEmailWithRetry(mailOptions);
        } catch (error) {
            console.error('❌ Lead notification email failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(userEmail, userName) {
        try {
            // Validate inputs
            if (!this.validateEmail(userEmail)) {
                throw new Error('Invalid user email address');
            }
            if (!userName) {
                throw new Error('User name is required');
            }
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

            const mailOptions = {
                from: process.env.EMAIL_FROM || `"MyGF AI" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: 'Welcome to MyGF AI! 🎉',
                html: emailHtml
            };

            return await this.sendEmailWithRetry(mailOptions);
        } catch (error) {
            console.error('❌ Welcome email failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send property published notification
     */
    async sendPropertyPublishedEmail(ownerEmail, property) {
        try {
            // Validate inputs
            if (!this.validateEmail(ownerEmail)) {
                throw new Error('Invalid owner email address');
            }
            if (!property || !property.title) {
                throw new Error('Property data is required');
            }
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

            const mailOptions = {
                from: process.env.EMAIL_FROM || `"MyGF AI" <${process.env.EMAIL_USER}>`,
                to: ownerEmail,
                subject: `Property Published: ${property.title}`,
                html: emailHtml
            };

            return await this.sendEmailWithRetry(mailOptions);
        } catch (error) {
            console.error('❌ Property published email failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email to new tenant
     */
    async sendTenantWelcomeEmail(tenant, tempPassword, property) {
        try {
            if (!this.isInitialized || !this.transporter) {
                throw new Error('Email service not initialized');
            }

            // Validate inputs
            if (!tenant || !tenant.email) {
                throw new Error('Tenant information is required');
            }
            if (!this.validateEmail(tenant.email)) {
                throw new Error('Invalid tenant email address');
            }
            if (!tempPassword) {
                throw new Error('Temporary password is required');
            }
            if (!property || !property.title) {
                throw new Error('Property information is required');
            }

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
        .credentials { background: #f0f4ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Welcome to Your New Home!</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Dear ${tenant.name},</p>

                <p>Welcome to <strong>${property.title}</strong>! We're excited to have you as our tenant.</p>

                <p><span class="label">Property Details:</span></p>
                <ul>
                    <li><strong>Address:</strong> ${property.location}</li>
                    ${tenant.unit ? `<li><strong>Unit:</strong> ${tenant.unit}</li>` : ''}
                    ${tenant.rentAmount ? `<li><strong>Monthly Rent:</strong> KSh ${tenant.rentAmount.toLocaleString()}</li>` : ''}
                    ${tenant.leaseStartDate ? `<li><strong>Lease Start:</strong> ${new Date(tenant.leaseStartDate).toLocaleDateString()}</li>` : ''}
                </ul>

                <div class="credentials">
                    <h3 style="margin-top: 0;">Your Portal Login Credentials</h3>
                    <p><span class="label">Email:</span> ${tenant.email}</p>
                    <p><span class="label">Temporary Password:</span> <strong>${tempPassword}</strong></p>
                </div>

                <div class="warning">
                    <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
                </div>

                <p>You can use the tenant portal to:</p>
                <ul>
                    <li>View your rent payment history</li>
                    <li>Submit maintenance requests</li>
                    <li>Communicate with your landlord</li>
                    <li>Update your contact information</li>
                </ul>

                <p>If you have any questions or concerns, please don't hesitate to reach out.</p>

                <p>Welcome aboard!</p>

                <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                    This is an automated message from MyGF AI Real Estate Platform.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: tenant.email,
                subject: `Welcome to ${property.title} - Your Login Credentials`,
                html: emailHtml
            };

            const result = await this.sendEmailWithRetry(mailOptions);
            if (result.success) {
                console.log(`✅ Welcome email sent to tenant: ${tenant.email}`);
            }
            return result;
        } catch (error) {
            console.error('❌ Tenant welcome email failed:', error.message);
            throw error;
        }
    }

    /**
     * Health check for email service
     */
    async healthCheck() {
        try {
            if (!this.isInitialized || !this.transporter) {
                return { status: 'unhealthy', message: 'Email service not initialized' };
            }

            await this.transporter.verify();
            return { status: 'healthy', message: 'Email service is working correctly' };
        } catch (error) {
            return { status: 'unhealthy', message: error.message };
        }
    }

    /**
     * Get email service statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            hasTransporter: !!this.transporter,
            config: {
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: process.env.EMAIL_PORT || '587',
                secure: process.env.EMAIL_SECURE === 'true',
                user: process.env.EMAIL_USER ? '***configured***' : 'not configured'
            }
        };
    }
}

module.exports = new EmailService();
