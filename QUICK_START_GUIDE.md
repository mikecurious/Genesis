# Quick Start Guide - New Features

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd /home/michael/OneDrive/Documents/Code/Genesis/backend
npm install
```

This will install the newly added packages:
- `node-cron` - For scheduled tasks
- `xlsx` - For Excel export

### 2. Start the Server
```bash
npm start
# or for development
npm run dev
```

You should see:
```
✅ Rent reminder service initialized
✅ Lead scoring service initialized
✅ Automated services initialized (rent reminders, lead scoring)
Server running on port 5000
```

---

## 📋 Feature-by-Feature Setup

### Feature 1: Automated Rent Reminders

**Prerequisites**:
- User must have role `Landlord`
- Tenants must be linked to landlord (`landlordId` field)

**Setup Steps**:

1. **Enable for a landlord** (automatic on first use):
```bash
# The feature is enabled by default in featureFlags
# Landlords can customize via API
```

2. **Update settings** (optional):
```bash
PUT http://localhost:5000/api/features/rent-reminders/settings
Authorization: Bearer <LANDLORD_TOKEN>
Content-Type: application/json

{
  "enabled": true,
  "daysBeforeDue": [7, 3, 1],
  "channels": {
    "email": true,
    "whatsapp": false,
    "push": true
  }
}
```

3. **Test manually**:
```bash
POST http://localhost:5000/api/features/rent-reminders/trigger
Authorization: Bearer <LANDLORD_TOKEN>
```

**Expected Behavior**:
- Cron runs daily at 9:00 AM
- Checks all tenants for the landlord
- Sends reminders based on `daysBeforeDue` settings
- Sends via enabled channels (email, WhatsApp, push)

---

### Feature 2: Lead Scoring System

**Prerequisites**:
- Leads must exist in the database
- User must be the lead creator (`createdBy`)

**Setup Steps**:

1. **View high-priority leads**:
```bash
GET http://localhost:5000/api/features/leads/high-priority?limit=10
Authorization: Bearer <USER_TOKEN>
```

2. **View all scored leads**:
```bash
GET http://localhost:5000/api/features/leads/scored
Authorization: Bearer <USER_TOKEN>
```

3. **Manually score a specific lead**:
```bash
POST http://localhost:5000/api/features/leads/:leadId/score
Authorization: Bearer <USER_TOKEN>
```

4. **Enable/disable auto follow-up**:
```bash
PUT http://localhost:5000/api/features/flags
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "leadScoring": {
    "enabled": true,
    "autoFollowUp": true,
    "followUpInterval": 2
  }
}
```

**Expected Behavior**:
- Scores update every hour automatically
- Follow-ups sent every 6 hours to eligible leads
- Emails personalized based on `buyingIntent` level
- Leads with score ≥ 60 marked as high-priority

---

### Feature 3: Chat-Based Surveyor Requests

**Prerequisites**:
- User must have properties listed
- Surveyors must exist with role `Surveyor`

**Setup Steps**:

1. **Request via AI chat**:
```bash
POST http://localhost:5000/api/ai-chat/message
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "message": "I need a surveyor for my apartment in Westlands"
}
```

2. **Request with specific property**:
```bash
POST http://localhost:5000/api/features/surveyor/request
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "message": "Need inspection for this property",
  "propertyId": "PROPERTY_ID_HERE"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Great! I found 3 qualified surveyors...",
  "surveyType": "inspection",
  "property": {...},
  "surveyors": [
    {
      "id": "surveyor_id",
      "name": "John Doe",
      "rating": 4.8,
      "experience": 10,
      "specializations": ["Residential"]
    }
  ],
  "requiresSelection": true
}
```

3. **Attach selected surveyor**:
```bash
POST http://localhost:5000/api/features/surveyor/attach
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "propertyId": "PROPERTY_ID",
  "surveyorId": "SURVEYOR_ID"
}
```

---

### Feature 4: Property-Attached Surveyor Logic

**Prerequisites**:
- Property must have attached surveyor (from Feature 3)

**Setup Steps**:

1. **View property's surveyor**:
```bash
GET http://localhost:5000/api/features/surveyor/property/:propertyId
Authorization: Bearer <USER_TOKEN>
```

2. **Update survey status** (Surveyor only):
```bash
PUT http://localhost:5000/api/features/surveyor/status/:propertyId
Authorization: Bearer <SURVEYOR_TOKEN>
Content-Type: application/json

{
  "status": "in-progress",
  "notes": "Initial inspection completed. Waiting for detailed measurements."
}
```

**Status Flow**:
```
not-requested → pending → in-progress → completed
```

---

### Feature 5: Financial Reporting with Excel Export

**Prerequisites**:
- User must have payment/transaction data
- For landlords: maintenance requests add to expenses

**Setup Steps**:

1. **Generate monthly report** (JSON):
```bash
POST http://localhost:5000/api/features/reports/generate
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "type": "monthly"
}
```

2. **Generate quarterly report**:
```bash
POST http://localhost:5000/api/features/reports/generate
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "type": "quarterly"
}
```

3. **Generate custom date range**:
```bash
POST http://localhost:5000/api/features/reports/generate
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

4. **Export to Excel** (downloads file):
```bash
POST http://localhost:5000/api/features/reports/export
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "type": "monthly"
}
```

**Expected Output**:
- JSON response with full report data
- OR Excel file download (`financial_report_[timestamp].xlsx`)
- File saved to: `backend/reports/`

**Report Includes**:
- Income breakdown by type
- Expense analysis
- Cashflow summary
- Property performance metrics
- AI-generated insights and recommendations

---

### Feature 6: Feature Control Flags

**Prerequisites**: None (available to all users)

**Setup Steps**:

1. **View current feature flags**:
```bash
GET http://localhost:5000/api/features/flags
Authorization: Bearer <USER_TOKEN>
```

2. **Update feature flags**:
```bash
PUT http://localhost:5000/api/features/flags
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "rentReminders": {
    "enabled": true,
    "daysBeforeDue": [7, 3],
    "channels": {
      "email": true,
      "whatsapp": false,
      "push": true
    }
  },
  "leadScoring": {
    "enabled": true,
    "autoFollowUp": false
  },
  "financialReports": {
    "enabled": true,
    "autoGenerate": false,
    "frequency": "monthly"
  }
}
```

**Available Flags**:
- `aiManager` - Core AI automation
- `rentReminders` - Automated rent reminders
- `leadScoring` - Lead scoring and auto follow-up
- `maintenanceAI` - AI maintenance analysis
- `financialReports` - Financial reporting
- `aiVoice` - AI voice features (Premium)

---

## 🧪 Testing Checklist

### ✅ Rent Reminders
- [ ] Landlord can trigger manual reminders
- [ ] Landlord can update settings
- [ ] Tenants receive emails on schedule
- [ ] Overdue notices sent correctly
- [ ] Multi-channel delivery works

### ✅ Lead Scoring
- [ ] Leads get scored automatically
- [ ] High-priority leads identified (score ≥ 60)
- [ ] Auto follow-ups sent on schedule
- [ ] Follow-up emails personalized by intent
- [ ] Can enable/disable per lead

### ✅ Surveyor Requests
- [ ] AI chat detects surveyor intent
- [ ] System recommends qualified surveyors
- [ ] Surveyor matches property type
- [ ] Can attach surveyor to property
- [ ] Property owner receives confirmation

### ✅ Property Surveyor Attachment
- [ ] Surveyor visible in property dashboard
- [ ] Surveyor can update status
- [ ] Status transitions work correctly
- [ ] Notes saved successfully
- [ ] Completion date recorded

### ✅ Financial Reports
- [ ] Monthly report generates correctly
- [ ] Quarterly report includes all data
- [ ] Custom date range works
- [ ] Excel export downloads successfully
- [ ] All sheets populated correctly
- [ ] Insights are relevant

### ✅ Feature Flags
- [ ] Can view current flags
- [ ] Can update individual flags
- [ ] Changes persist in database
- [ ] Features respect flag settings
- [ ] Premium features blocked appropriately

---

## 🔍 Troubleshooting

### Cron Jobs Not Running

**Check**:
```bash
# Server logs should show:
✅ Rent reminder service initialized
✅ Lead scoring service initialized
```

**Solution**:
- Ensure server started successfully
- Check for errors in console
- Verify services imported correctly in `server.js`

### Rent Reminders Not Sending

**Check**:
1. Landlord has `featureFlags.rentReminders.enabled = true`
2. Tenants have `landlordId` set
3. Email service configured (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD)
4. Cron job running (check logs)

**Solution**:
```bash
# Test manually:
POST /api/features/rent-reminders/trigger

# Check email service:
curl http://localhost:5000/api/health
# Look for: services.email.status = "configured"
```

### Lead Scoring Not Working

**Check**:
1. Leads exist in database
2. Leads have `createdBy` matching user
3. Feature enabled: `featureFlags.leadScoring.enabled = true`

**Solution**:
```bash
# Manually score a lead:
POST /api/features/leads/:leadId/score

# Check if score updated:
GET /api/features/leads/scored
```

### Surveyor Request Not Finding Surveyors

**Check**:
1. Surveyors exist with role `Surveyor`
2. Surveyors have `surveyorProfile.availability = 'Available'`
3. Surveyors have matching specializations

**Solution**:
```bash
# Create test surveyor or update existing user:
PUT /api/users/:userId
{
  "role": "Surveyor",
  "surveyorProfile": {
    "availability": "Available",
    "specializations": ["Residential"],
    "rating": 5.0,
    "yearsOfExperience": 5
  }
}
```

### Excel Export Not Working

**Check**:
1. `backend/reports/` directory exists
2. Write permissions on reports directory
3. `xlsx` package installed

**Solution**:
```bash
# Create reports directory:
mkdir -p backend/reports

# Check package:
cd backend && npm list xlsx
```

---

## 📊 Sample Data for Testing

### Create Test Landlord
```javascript
// Register with role selection during setup
POST /api/auth/register
{
  "name": "Test Landlord",
  "email": "landlord@test.com",
  "password": "Test123!@#",
  "role": "Landlord"
}
```

### Create Test Tenant
```javascript
POST /api/users (Admin only) or via tenant registration
{
  "name": "Test Tenant",
  "email": "tenant@test.com",
  "role": "Tenant",
  "landlordId": "LANDLORD_ID_HERE",
  "unit": "Apartment 101",
  "rentStatus": "Due"
}
```

### Create Test Surveyor
```javascript
POST /api/auth/register
{
  "name": "Test Surveyor",
  "email": "surveyor@test.com",
  "password": "Test123!@#",
  "role": "Surveyor"
}

// Then update profile:
PUT /api/surveyor/profile
{
  "bio": "Experienced property surveyor",
  "specializations": ["Residential", "Commercial"],
  "yearsOfExperience": 10,
  "availability": "Available",
  "services": [
    {
      "name": "Property Inspection",
      "description": "Comprehensive property inspection",
      "price": 5000
    }
  ]
}
```

---

## 🎯 Next Steps

1. **Start the server** and verify cron jobs initialize
2. **Test each feature** using the API endpoints
3. **Check logs** for automated execution
4. **Monitor performance** of cron jobs
5. **Adjust settings** based on usage patterns

For detailed API documentation, see `IMPLEMENTED_FEATURES.md`

---

## 📞 Support

If you encounter issues:
1. Check server logs: `backend/logs/`
2. Verify feature flags are enabled
3. Ensure proper user roles and permissions
4. Review database indexes are created
5. Check environment variables configured

---

## ✨ All Features Are Live!

You can now use all 6 highly implementable features:
1. ✅ Automated Rent Reminders
2. ✅ Lead Scoring System
3. ✅ Chat-Based Surveyor Requests
4. ✅ Property-Attached Surveyor Logic
5. ✅ Financial Reporting with Excel Export
6. ✅ Feature Control Flags

Happy coding! 🚀
