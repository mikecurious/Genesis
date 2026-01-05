const cron = require('node-cron');
const User = require('../models/User');
const Payment = require('../models/Payment');
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');
const Notification = require('../models/Notification');

class RentReminderService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Initialize rent reminder cron jobs
     */
    initialize() {
        // Run daily at 9:00 AM to check for upcoming rent due dates
        const dailyReminderJob = cron.schedule('0 9 * * *', async () => {
            console.log('🔔 Running daily rent reminder check...');
            await this.checkAndSendReminders();
        });

        this.jobs.push(dailyReminderJob);
        console.log('✅ Rent reminder service initialized');
    }

    /**
     * Check and send rent reminders based on tenant status
     */
    async checkAndSendReminders() {
        try {
            // Find all landlords with active rent reminder feature
            const landlords = await User.find({
                role: 'Landlord',
                'featureFlags.rentReminders.enabled': true,
                accountStatus: 'active'
            });

            for (const landlord of landlords) {
                await this.processLandlordTenants(landlord);
            }

            console.log('✅ Rent reminder check completed');
        } catch (error) {
            console.error('❌ Error in rent reminder service:', error);
        }
    }

    /**
     * Process all tenants for a specific landlord
     */
    async processLandlordTenants(landlord) {
        try {
            // Find all tenants for this landlord
            const tenants = await User.find({
                landlordId: landlord._id,
                role: 'Tenant',
                accountStatus: 'active'
            });

            const reminderDays = landlord.featureFlags?.rentReminders?.daysBeforeDue || [7, 3, 1];
            const channels = landlord.featureFlags?.rentReminders?.channels || {
                email: true,
                whatsapp: false,
                push: true
            };

            for (const tenant of tenants) {
                await this.checkTenantRentStatus(tenant, landlord, reminderDays, channels);
            }
        } catch (error) {
            console.error(`❌ Error processing tenants for landlord ${landlord._id}:`, error);
        }
    }

    /**
     * Check individual tenant's rent status and send reminders
     */
    async checkTenantRentStatus(tenant, landlord, reminderDays, channels) {
        try {
            // Determine rent due date (assuming monthly rent due on 1st of each month)
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            // Next rent due date (1st of next month if today is past the 1st, otherwise 1st of current month)
            let rentDueDate;
            if (today.getDate() > 1) {
                rentDueDate = new Date(currentYear, currentMonth + 1, 1);
            } else {
                rentDueDate = new Date(currentYear, currentMonth, 1);
            }

            const daysUntilDue = Math.ceil((rentDueDate - today) / (1000 * 60 * 60 * 24));

            // Check if we should send a reminder based on configured days
            if (reminderDays.includes(daysUntilDue)) {
                await this.sendRentReminder(tenant, landlord, daysUntilDue, channels);
            }

            // Check for overdue rent
            if (tenant.rentStatus === 'Overdue' || (daysUntilDue < 0 && tenant.rentStatus !== 'Paid')) {
                await this.sendOverdueNotice(tenant, landlord, Math.abs(daysUntilDue), channels);
            }
        } catch (error) {
            console.error(`❌ Error checking rent status for tenant ${tenant._id}:`, error);
        }
    }

    /**
     * Send rent reminder to tenant
     */
    async sendRentReminder(tenant, landlord, daysUntilDue, channels) {
        try {
            const message = this.generateReminderMessage(tenant, landlord, daysUntilDue);

            // Send via enabled channels
            if (channels.email && tenant.email) {
                await this.sendEmailReminder(tenant, landlord, daysUntilDue);
            }

            if (channels.whatsapp && tenant.whatsappNumber) {
                await this.sendWhatsAppReminder(tenant, message);
            }

            if (channels.push) {
                await this.sendPushNotification(tenant, message);
            }

            console.log(`✅ Rent reminder sent to tenant ${tenant.email} (${daysUntilDue} days until due)`);
        } catch (error) {
            console.error(`❌ Error sending rent reminder to tenant ${tenant._id}:`, error);
        }
    }

    /**
     * Send overdue notice to tenant
     */
    async sendOverdueNotice(tenant, landlord, daysOverdue, channels) {
        try {
            const message = `⚠️ OVERDUE NOTICE: Your rent payment is ${daysOverdue} day(s) overdue. Please make payment immediately to avoid penalties. Contact your landlord: ${landlord.email}`;

            if (channels.email && tenant.email) {
                await this.sendEmailOverdueNotice(tenant, landlord, daysOverdue);
            }

            if (channels.whatsapp && tenant.whatsappNumber) {
                await whatsappService.sendMessage(tenant.whatsappNumber, message);
            }

            if (channels.push) {
                await Notification.create({
                    user: tenant._id,
                    title: '⚠️ Rent Overdue',
                    message: message,
                    type: 'payment',
                    priority: 'high'
                });
            }

            console.log(`⚠️ Overdue notice sent to tenant ${tenant.email} (${daysOverdue} days overdue)`);
        } catch (error) {
            console.error(`❌ Error sending overdue notice to tenant ${tenant._id}:`, error);
        }
    }

    /**
     * Generate reminder message
     */
    generateReminderMessage(tenant, landlord, daysUntilDue) {
        const unit = tenant.unit || 'your unit';
        return `🏠 Rent Reminder: Your rent payment for ${unit} is due in ${daysUntilDue} day(s). Please ensure timely payment. Contact: ${landlord.email}`;
    }

    /**
     * Send email reminder
     */
    async sendEmailReminder(tenant, landlord, daysUntilDue) {
        if (!emailService.isInitialized) {
            console.warn('⚠️  Email service not initialized, skipping email reminder');
            return;
        }

        const emailHtml = `
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
        .urgent { color: #dc2626; font-weight: bold; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Rent Payment Reminder</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Dear ${tenant.name},</p>
                <p>This is a friendly reminder that your rent payment is due in <span class="urgent">${daysUntilDue} day(s)</span>.</p>

                <p><span class="label">Unit:</span> ${tenant.unit || 'N/A'}</p>
                <p><span class="label">Landlord:</span> ${landlord.name}</p>
                <p><span class="label">Contact:</span> ${landlord.email}</p>

                <p>Please ensure your payment is made on time to avoid any late fees or penalties.</p>

                <p>Thank you for your cooperation!</p>

                <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                    This is an automated reminder from MyGF AI Real Estate Platform.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"MyGF AI" <${process.env.EMAIL_USER}>`,
            to: tenant.email,
            subject: `🏠 Rent Payment Due in ${daysUntilDue} Day(s)`,
            html: emailHtml
        };

        await emailService.sendEmailWithRetry(mailOptions);
    }

    /**
     * Send email overdue notice
     */
    async sendEmailOverdueNotice(tenant, landlord, daysOverdue) {
        if (!emailService.isInitialized) {
            console.warn('⚠️  Email service not initialized, skipping overdue notice');
            return;
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .label { font-weight: bold; color: #dc2626; }
        .urgent { color: #dc2626; font-weight: bold; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ OVERDUE RENT PAYMENT NOTICE</h1>
        </div>
        <div class="content">
            <div class="card">
                <p>Dear ${tenant.name},</p>
                <p class="urgent">Your rent payment is now ${daysOverdue} day(s) OVERDUE.</p>

                <p><span class="label">Unit:</span> ${tenant.unit || 'N/A'}</p>
                <p><span class="label">Landlord:</span> ${landlord.name}</p>
                <p><span class="label">Contact:</span> ${landlord.email}</p>

                <p>Please make payment immediately to avoid further penalties and potential legal action.</p>

                <p>If you have already made payment, please contact your landlord to confirm receipt.</p>

                <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
                    This is an automated notice from MyGF AI Real Estate Platform.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"MyGF AI" <${process.env.EMAIL_USER}>`,
            to: tenant.email,
            subject: `⚠️ URGENT: Rent Payment ${daysOverdue} Day(s) Overdue`,
            html: emailHtml
        };

        await emailService.sendEmailWithRetry(mailOptions);
    }

    /**
     * Send WhatsApp reminder
     */
    async sendWhatsAppReminder(tenant, message) {
        await whatsappService.sendMessage(tenant.whatsappNumber, message);
    }

    /**
     * Send push notification
     */
    async sendPushNotification(tenant, message) {
        await Notification.create({
            user: tenant._id,
            title: '🏠 Rent Reminder',
            message: message,
            type: 'payment',
            priority: 'medium'
        });
    }

    /**
     * Manually trigger reminders for a specific landlord
     */
    async triggerRemindersForLandlord(landlordId) {
        const landlord = await User.findById(landlordId);
        if (!landlord || landlord.role !== 'Landlord') {
            throw new Error('Invalid landlord');
        }

        await this.processLandlordTenants(landlord);
        return { success: true, message: 'Reminders sent to all tenants' };
    }

    /**
     * Stop all cron jobs
     */
    stop() {
        this.jobs.forEach(job => job.stop());
        console.log('🛑 Rent reminder service stopped');
    }
}

module.exports = new RentReminderService();
