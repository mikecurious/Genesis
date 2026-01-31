# Twilio Integration Implementation Plan
**Genesis Real Estate Platform - Complete Communication Overhaul**

## Executive Summary

Based on comprehensive system scan, this document outlines the complete integration of Twilio services (SMS, WhatsApp, SendGrid Email) across all communication touchpoints in the Genesis platform.

**Current State:**
- ✅ 60% communication infrastructure ready (Email service, OTP, Rent reminders)
- ✅ Twilio service layer fully implemented
- ⚠️ 30% partially implemented (notifications exist but no SMS/WhatsApp)
- ❌ 10% completely missing (payment notifications, two-way messaging)

**Your Twilio Credentials (Already in your .env file):**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1xxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```
*(Use the actual values from your backend/.env file)*

---

## Phase 1: Critical Missing Integrations (HIGH PRIORITY)

### 1.1 Payment Notifications ❌ MISSING
**Location:** `backend/controllers/payments.js`

**Current State:** Payment processing exists but no notifications sent

**Required Notifications:**
- Payment received confirmation
- Payment receipt with transaction details
- Subscription activated
- Payment failed with retry instructions
- Upcoming renewal reminders

**Implementation:**
```javascript
// backend/controllers/payments.js
const twilioService = require('../services/twilioService');

// After successful M-Pesa payment
async function handlePaymentSuccess(payment) {
    const user = await User.findById(payment.userId);

    // Send multi-channel confirmation
    await twilioService.sendMultiChannelNotification({
        phone: user.phone,
        email: user.email,
        message: `Payment of KSh ${payment.amount} received! Transaction ID: ${payment.transactionId}`,
        subject: 'Payment Confirmation - MyGF AI',
        htmlEmail: generatePaymentReceiptHTML(payment)
    });
}

// Payment failed
async function handlePaymentFailed(payment) {
    await twilioService.sendSMS({
        to: user.phone,
        message: `Payment failed. Reason: ${payment.failureReason}. Please try again or contact support.`
    });
}
```

**Files to Modify:**
- `backend/controllers/payments.js` - Add notification calls
- `backend/services/twilioService.js` - Add payment templates (already ready)

**Estimated Time:** 2-3 hours

---

### 1.2 Maintenance Assignment Notifications ⚠️ PARTIAL
**Location:** `backend/controllers/maintenance.js`

**Current State:** Maintenance requests created, but technician assignment doesn't notify

**Required Notifications:**
- Technician assigned → Notify technician
- Status updated → Notify tenant
- Maintenance completed → Notify tenant
- Urgent maintenance → Immediate SMS to landlord

**Implementation:**
```javascript
// backend/controllers/maintenance.js
const twilioService = require('../services/twilioService');

// When assigning technician
router.patch('/:id/assign', protect, authorize('admin', 'landlord'), async (req, res) => {
    const { technicianId } = req.body;
    const maintenance = await MaintenanceRequest.findById(req.params.id);
    const technician = await ServiceProvider.findById(technicianId);

    maintenance.assignedTo = technicianId;
    maintenance.status = 'in_progress';
    await maintenance.save();

    // Send notification to technician
    await twilioService.sendMaintenanceUpdate({
        to: technician.phone,
        maintenanceType: maintenance.issueType,
        priority: maintenance.priority,
        propertyAddress: maintenance.propertyId.location,
        description: maintenance.description,
        tenantName: maintenance.tenant.name,
        tenantPhone: maintenance.tenant.phone
    });

    res.json({ success: true, maintenance });
});

// When status changes
router.patch('/:id/status', protect, async (req, res) => {
    const { status } = req.body;
    const maintenance = await MaintenanceRequest.findById(req.params.id).populate('tenant');

    maintenance.status = status;
    await maintenance.save();

    // Notify tenant
    await twilioService.sendSMS({
        to: maintenance.tenant.phone,
        message: `Maintenance Update: Your ${maintenance.issueType} request is now ${status}. ${status === 'completed' ? 'Issue has been resolved!' : ''}`
    });

    res.json({ success: true, maintenance });
});
```

**Files to Modify:**
- `backend/controllers/maintenance.js` - Add notifications on assign/update/complete
- `backend/routes/maintenance.js` - New routes for status updates

**Estimated Time:** 2-3 hours

---

### 1.3 Surveyor Assignment Notifications ⚠️ PARTIAL
**Location:** `backend/controllers/surveyor.js`

**Current State:** Surveyors can be assigned to tasks, but no notifications

**Required Notifications:**
- Surveyor assigned to property → Notify surveyor
- Survey report submitted → Notify property owner
- Survey request created → Notify available surveyors

**Implementation:**
```javascript
// backend/controllers/surveyor.js
const twilioService = require('../services/twilioService');

// When creating survey task
exports.createSurveyTask = async (req, res) => {
    const { propertyId, surveyorId, dueDate } = req.body;

    const task = await SurveyTask.create({
        property: propertyId,
        surveyor: surveyorId,
        requestedBy: req.user.id,
        dueDate
    });

    const surveyor = await User.findById(surveyorId);
    const property = await Property.findById(propertyId);

    // Notify surveyor
    await twilioService.sendMultiChannelNotification({
        phone: surveyor.phone,
        email: surveyor.email,
        message: `New survey task assigned: ${property.title} at ${property.location}. Due: ${dueDate}`,
        subject: 'New Survey Assignment - MyGF AI',
        htmlEmail: `<h2>New Survey Task</h2>
                    <p><strong>Property:</strong> ${property.title}</p>
                    <p><strong>Location:</strong> ${property.location}</p>
                    <p><strong>Due Date:</strong> ${dueDate}</p>
                    <p><a href="https://yourapp.com/surveyor/tasks/${task._id}">View Task Details</a></p>`
    });

    res.json({ success: true, task });
};

// When survey completed
exports.submitSurveyReport = async (req, res) => {
    const { taskId, reportData } = req.body;

    const task = await SurveyTask.findById(taskId).populate('property requestedBy');
    task.status = 'completed';
    task.report = reportData;
    await task.save();

    // Notify property owner
    await twilioService.sendEmail({
        to: task.requestedBy.email,
        subject: `Survey Report Ready - ${task.property.title}`,
        html: `<h2>Survey Report Completed</h2>
               <p>The survey for ${task.property.title} has been completed.</p>
               <p><a href="https://yourapp.com/properties/${task.property._id}/survey-report">View Report</a></p>`
    });

    res.json({ success: true, task });
};
```

**Files to Modify:**
- `backend/controllers/surveyor.js` - Add notifications
- Create new route for survey completion if missing

**Estimated Time:** 2 hours

---

### 1.4 Viewing Reminders - Add SMS/WhatsApp ⚠️ EMAIL ONLY
**Location:** `backend/services/viewingSchedulerService.js`

**Current State:** Email reminders sent 24 hours before viewing

**Enhancement:** Add SMS and WhatsApp reminders

**Implementation:**
```javascript
// backend/services/viewingSchedulerService.js
const twilioService = require('./twilioService');

// Enhance existing sendViewingReminders function
async sendViewingReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingViewings = await Viewing.find({
        date: {
            $gte: tomorrow.setHours(0, 0, 0, 0),
            $lt: tomorrow.setHours(23, 59, 59, 999)
        },
        status: 'scheduled'
    }).populate('lead property attendees');

    for (const viewing of upcomingViewings) {
        // Send email (existing)
        await this.generateReminderEmail(viewing);

        // NEW: Send WhatsApp reminder to lead
        if (viewing.lead.whatsappNumber) {
            await twilioService.sendWhatsApp({
                to: viewing.lead.whatsappNumber,
                message: `⏰ *Viewing Reminder*\n\n` +
                         `Your property viewing is tomorrow at ${viewing.formattedTime}.\n\n` +
                         `📍 *Property:* ${viewing.property.title}\n` +
                         `📌 *Location:* ${viewing.property.location}\n` +
                         `👤 *Agent:* ${viewing.agent.name}\n\n` +
                         `See you there! 🏠`
            });
        }

        // NEW: Send SMS to agent if no WhatsApp
        if (viewing.agent.phone && !viewing.agent.whatsappNumber) {
            await twilioService.sendSMS({
                to: viewing.agent.phone,
                message: `Reminder: Property viewing tomorrow at ${viewing.formattedTime} - ${viewing.property.title}. Client: ${viewing.lead.name} ${viewing.lead.phone}`
            });
        }
    }
}
```

**Files to Modify:**
- `backend/services/viewingSchedulerService.js` - Enhance sendViewingReminders()

**Estimated Time:** 1 hour

---

## Phase 2: Enhanced Integrations (MEDIUM PRIORITY)

### 2.1 Lead Capture - Consolidate to Twilio Multi-Channel ✓ ENHANCE
**Location:** `backend/controllers/leads.js`

**Current State:** Uses separate whatsappService

**Enhancement:** Replace with twilioService multi-channel fallback

**Implementation:**
```javascript
// backend/controllers/leads.js
const twilioService = require('../services/twilioService');

// Replace existing WhatsApp notification
exports.createLead = async (req, res) => {
    // ... existing lead creation code ...

    // Replace this:
    // await whatsappService.sendLeadNotification(...)

    // With multi-channel notification:
    await twilioService.sendLeadNotification({
        phone: property.owner.phone,
        whatsappNumber: property.owner.whatsappNumber,
        email: property.owner.email,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyPrice: property.price,
        clientName: lead.client.name,
        clientEmail: lead.client.email,
        clientPhone: lead.client.contactPhone,
        dealType: lead.dealType,
        message: lead.message
    });

    res.json({ success: true, lead });
};
```

**Files to Modify:**
- `backend/controllers/leads.js` - Replace whatsappService with twilioService

**Estimated Time:** 30 minutes

---

### 2.2 Registration/Welcome - Add SMS Welcome ✓ ENHANCE
**Location:** `backend/controllers/auth.js`

**Current State:** Email verification sent

**Enhancement:** Add SMS welcome message

**Implementation:**
```javascript
// backend/controllers/auth.js
const twilioService = require('../services/twilioService');

exports.register = async (req, res) => {
    // ... existing registration code ...

    // Send email verification (existing)
    await emailService.sendEmail({...});

    // NEW: Send SMS welcome
    if (user.phone) {
        await twilioService.sendSMS({
            to: user.phone,
            message: `Welcome to MyGF AI, ${user.name}! 🎉\n\n` +
                     `Your account has been created successfully. Check your email for verification code.\n\n` +
                     `Start exploring properties now!`
        });
    }

    res.status(201).json({ success: true, user, token });
};
```

**Files to Modify:**
- `backend/controllers/auth.js` - Add SMS to registration

**Estimated Time:** 30 minutes

---

### 2.3 Tenant Welcome - Add SMS with Login Details ✓ ENHANCE
**Location:** `backend/services/emailService.js` (sendTenantWelcomeEmail)

**Current State:** Email sent with temporary password

**Enhancement:** Also send SMS with login link

**Implementation:**
```javascript
// backend/controllers/tenants.js or wherever tenant is created
const twilioService = require('../services/twilioService');

async function createTenant(tenantData) {
    // ... existing tenant creation ...

    // Send email (existing)
    await emailService.sendTenantWelcomeEmail(tenant.email, {
        tenantName: tenant.name,
        loginUrl: `${process.env.FRONTEND_URL}/tenant-login`,
        email: tenant.email,
        tempPassword: tempPassword
    });

    // NEW: Send SMS with credentials
    await twilioService.sendSMS({
        to: tenant.phone,
        message: `Welcome to your Tenant Portal! 🏠\n\n` +
                 `Login: ${process.env.FRONTEND_URL}/tenant-login\n` +
                 `Email: ${tenant.email}\n` +
                 `Password: ${tempPassword}\n\n` +
                 `Please change your password after first login.`
    });
}
```

**Files to Modify:**
- Find tenant creation location (likely `backend/controllers/tenants.js`)
- Add SMS notification

**Estimated Time:** 1 hour

---

### 2.4 Property Published - Add SMS to Owner ✓ ENHANCE
**Location:** Wherever property status changes to 'published'

**Current State:** Email sent via emailService

**Enhancement:** Add SMS congratulations

**Implementation:**
```javascript
// backend/controllers/properties.js
const twilioService = require('../services/twilioService');

exports.publishProperty = async (req, res) => {
    const property = await Property.findById(req.params.id);
    property.status = 'published';
    await property.save();

    // Send email (existing)
    await emailService.sendPropertyPublishedEmail(...);

    // NEW: Send SMS
    await twilioService.sendSMS({
        to: property.owner.phone,
        message: `🎉 Your property "${property.title}" is now live on MyGF AI!\n\n` +
                 `View it: ${process.env.FRONTEND_URL}/properties/${property._id}\n\n` +
                 `We'll notify you of any leads immediately.`
    });

    res.json({ success: true, property });
};
```

**Files to Modify:**
- `backend/controllers/properties.js` - Add SMS to publish

**Estimated Time:** 30 minutes

---

### 2.5 Rent Reminders - Verify Multi-Channel Works ✓ TEST
**Location:** `backend/services/rentReminderService.js`

**Current State:** Multi-channel implemented (email, WhatsApp, push)

**Action Required:**
- Test with real Twilio credentials
- Verify all channels work
- Check landlord feature flags are respected

**Testing:**
```bash
# Manual trigger test
curl -X POST http://localhost:5000/api/features/rent-reminders/trigger \
  -H "Authorization: Bearer YOUR_LANDLORD_TOKEN"
```

**Files to Verify:**
- `backend/services/rentReminderService.js` - Already uses twilioService ✓
- Ensure TWILIO credentials in .env

**Estimated Time:** 1 hour (testing only)

---

## Phase 3: Advanced Features (LOW PRIORITY / FUTURE)

### 3.1 Two-Way SMS/WhatsApp Conversations ❌ NEW FEATURE
**Use Case:** Users reply to messages, system processes responses

**Implementation:**
- Add webhook endpoints in `backend/routes/twilio.js`
- Create conversation state machine
- Parse incoming messages for keywords (YES, NO, CONFIRM, CANCEL)
- Store conversation context in Redis or database

**Example Flow:**
```
System: "Confirm viewing tomorrow at 10 AM? Reply YES or NO"
User: "YES"
System: "Great! Viewing confirmed. See you at 10 AM."
```

**Files to Create:**
- `backend/services/conversationService.js`
- `backend/models/Conversation.js`
- Add routes to `backend/routes/twilio.js`

**Estimated Time:** 8-10 hours

---

### 3.2 Scheduled Messages & Campaigns ❌ NEW FEATURE
**Use Case:** Schedule messages for future delivery, broadcast campaigns

**Implementation:**
- Create ScheduledMessage model
- Add cron job to check for due messages
- Admin panel to create campaigns
- Segment users by role, location, activity

**Files to Create:**
- `backend/models/ScheduledMessage.js`
- `backend/services/campaignService.js`
- `backend/controllers/campaigns.js`
- `backend/routes/campaigns.js`

**Estimated Time:** 10-12 hours

---

### 3.3 Analytics Dashboard ❌ NEW FEATURE
**Use Case:** Track message delivery, open rates, response rates

**Implementation:**
- Store delivery status from webhooks
- Create analytics aggregation
- Build dashboard UI
- Track costs per channel

**Files to Create:**
- `backend/models/MessageLog.js`
- `backend/services/analyticsService.js`
- `backend/controllers/messageAnalytics.js`
- `frontend/components/MessageAnalyticsDashboard.tsx`

**Estimated Time:** 12-15 hours

---

### 3.4 SMS Shortcodes for Quick Actions ❌ NEW FEATURE
**Use Case:** Users reply with shortcodes like "VIEW", "INFO", "CONTACT"

**Implementation:**
- Parse incoming SMS for keywords
- Map keywords to actions
- Respond with appropriate information

**Example:**
```
User sends: "INFO [property-id]"
System responds: "Property: 3BR House in Nairobi. Price: KSh 15M. Call 0712345678 to schedule viewing."
```

**Estimated Time:** 6-8 hours

---

## Environment Variables - Complete Setup

### Production (.env on Render)
```bash
# Twilio (SMS & WhatsApp) - Use your actual credentials from backend/.env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1xxxxxxxxxx

# SendGrid (Twilio Email Service)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@mygf.ai

# Email (SMTP - Backup)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="MyGF AI" <noreply@mygf.ai>

# Africa's Talking (Backup SMS Provider)
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key

# Frontend URL (for links in messages)
FRONTEND_URL=https://your-frontend.onrender.com

# Node Environment
NODE_ENV=production
```

---

## Implementation Order - Recommended

### Week 1: Critical Fixes (Phase 1)
**Day 1-2:** Payment Notifications (1.1)
**Day 3:** Maintenance Assignment (1.2)
**Day 4:** Surveyor Assignment (1.3)
**Day 5:** Viewing SMS/WhatsApp (1.4)

### Week 2: Enhancements (Phase 2)
**Day 1:** Lead Multi-Channel (2.1)
**Day 2:** Registration SMS (2.2)
**Day 3:** Tenant Welcome SMS (2.3)
**Day 4:** Property Published SMS (2.4)
**Day 5:** Test Rent Reminders (2.5)

### Week 3+: Advanced Features (Phase 3) - Optional
Implement based on user feedback and usage patterns.

---

## Testing Checklist

### Before Deployment
- [ ] All Twilio credentials in Render environment
- [ ] SendGrid sender email verified
- [ ] Twilio phone number active
- [ ] WhatsApp sandbox joined (or Business API approved)

### After Deployment
- [ ] Test OTP send to +254758930908
- [ ] Create test lead and verify notification
- [ ] Schedule test viewing and check reminder
- [ ] Create test maintenance request
- [ ] Trigger rent reminder manually
- [ ] Process test payment
- [ ] Check webhook logs at /api/twilio/status

### Production Validation
- [ ] Monitor Twilio dashboard for delivery status
- [ ] Check SendGrid for email delivery rates
- [ ] Review Twilio costs after first week
- [ ] Collect user feedback on notifications
- [ ] A/B test message templates

---

## Cost Estimates (Twilio Pricing)

### Per Message:
- **SMS:** ~$0.01 USD (~KSh 1.50) per message
- **WhatsApp:** ~$0.005 USD (~KSh 0.75) per message
- **Email (SendGrid):** Free for first 100/day, then $0.00028/email

### Monthly Estimate (1000 Users):
- **Lead Notifications:** 500 leads/month × $0.005 = $2.50
- **Viewing Reminders:** 300 viewings/month × $0.01 = $3.00
- **Rent Reminders:** 200 tenants × 3 reminders/month × $0.005 = $3.00
- **OTP Verification:** 1000 registrations × $0.01 = $10.00
- **Maintenance Updates:** 100 requests × 2 updates × $0.005 = $1.00

**Total: ~$20/month for 1000 active users**

**Optimization:** Use WhatsApp first (cheaper), fallback to SMS.

---

## Support & Resources

### Twilio Resources:
- Console: https://console.twilio.com
- Logs: https://console.twilio.com/monitor/logs
- WhatsApp Setup: https://console.twilio.com/whatsapp/senders
- SendGrid Dashboard: https://app.sendgrid.com

### Webhooks to Configure:
1. **SMS Status Callback:** `https://your-app.onrender.com/api/twilio/status`
2. **WhatsApp Status Callback:** `https://your-app.onrender.com/api/twilio/status`
3. **SendGrid Event Webhook:** `https://your-app.onrender.com/api/twilio/email-events`

### Testing Endpoints:
- Health Check: `GET /api/twilio/health`
- Test Message: `POST /api/twilio/test`
- Test OTP: `POST /api/otp/send`

---

## Next Steps

1. **Review this plan** and confirm priorities
2. **Add SendGrid API key** to your Render environment (only missing credential)
3. **Start with Phase 1.1** (Payment Notifications) - highest business impact
4. **Test each integration** before moving to next
5. **Monitor costs** in Twilio console after first week

**Ready to start implementation?** Let me know which phase to begin with!
