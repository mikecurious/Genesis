# Twilio Integration Guide
## Complete Setup for SMS, WhatsApp, and Email (SendGrid)

This guide provides all the information you need to set up Twilio integration for production and testing environments.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Production Setup](#production-setup)
3. [Testing Setup](#testing-setup)
4. [Environment Variables](#environment-variables)
5. [Cost Estimates](#cost-estimates)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The MyGF AI platform uses Twilio for:
- **SMS**: Property alerts, lead notifications, rent reminders
- **WhatsApp**: Rich messaging with formatting and multimedia
- **Email (SendGrid)**: Professional HTML emails with tracking
- **Multi-Channel**: Automatic fallback (WhatsApp → SMS → Email)

---

## 🚀 Production Setup

### Step 1: Create Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a new account
3. Verify your email and phone number
4. **Upgrade to a paid account** (required for production)

### Step 2: Get Twilio Credentials
1. Go to [Twilio Console](https://console.twilio.com/)
2. From the Dashboard, copy:
   - **Account SID** (e.g., `AC...`)
   - **Auth Token** (click "Show" to reveal)

### Step 3: Get a Phone Number for SMS
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country (Kenya: +254)
3. Check **SMS** capability
4. Purchase the number (costs ~$1/month)
5. Copy the phone number (e.g., `+254712345678`)

### Step 4: Set Up WhatsApp Business
1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the WhatsApp Business API setup:
   - Apply for WhatsApp Business API access
   - Verify your business
   - Get your WhatsApp-enabled phone number
3. OR use Twilio Sandbox for testing:
   - Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Join sandbox by sending a message to the sandbox number
   - Use sandbox number for testing (e.g., `whatsapp:+14155238886`)

**Production WhatsApp (Recommended):**
- Costs: $0.005 - $0.02 per message (varies by country)
- Requires: Business verification (1-2 weeks)
- Benefits: Your own phone number, no "sandbox" prefix

### Step 5: Set Up SendGrid for Email
1. Go to [https://sendgrid.com/](https://sendgrid.com/)
2. Sign up (Twilio owns SendGrid - use same account if possible)
3. Verify your email
4. Go to **Settings** → **API Keys**
5. Create a new API key with **Full Access**
6. Copy the API key (you'll only see it once!)

### Step 6: Verify Sender Email
1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Choose either:
   - **Single Sender Verification** (quick, for testing)
   - **Domain Authentication** (recommended for production)
3. For Single Sender:
   - Add your email (e.g., `noreply@yourdomain.com`)
   - Click the verification link sent to that email
4. For Domain Authentication:
   - Verify your domain with DNS records
   - More professional, better deliverability

### Step 7: Set Up Webhooks (Optional but Recommended)
1. **For SMS/WhatsApp Status Updates:**
   - In Twilio Console → **Messaging** → **Settings**
   - Set Status Callback URL: `https://your-domain.com/api/twilio/status`
   - Select events: `delivered`, `failed`, `undelivered`

2. **For SendGrid Email Events:**
   - In SendGrid → **Settings** → **Mail Settings** → **Event Webhook**
   - Set HTTP POST URL: `https://your-domain.com/api/twilio/email-events`
   - Select events: `delivered`, `bounced`, `opened`, `clicked`

---

## 🧪 Testing Setup

### Option 1: Twilio Trial Account (FREE - Limited)
**Best for:** Initial development and testing

**What you get:**
- $15.50 trial credit
- SMS to verified numbers only
- WhatsApp sandbox access
- SendGrid: 100 emails/day free forever

**Limitations:**
- Can only send to phone numbers you verify
- SMS includes "Sent from a Twilio trial account" prefix
- WhatsApp sandbox requires users to opt-in
- Cannot use custom phone numbers

**Setup:**
1. Create trial account at [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Get free credentials (Account SID, Auth Token)
3. Use trial phone number for SMS
4. Use WhatsApp sandbox (`whatsapp:+14155238886`)
5. Sign up for SendGrid free tier

### Option 2: Paid Account (Recommended for Staging/Production)
**Best for:** Real testing and production

**Minimum costs:**
- Phone number: $1/month
- SMS: ~$0.01 per message (Kenya)
- WhatsApp: ~$0.005 per message
- SendGrid: First 100 emails/day are FREE

---

## 🔐 Environment Variables

Add these to your `.env` file or Render environment variables:

```bash
# ===== TWILIO CREDENTIALS =====
# Required: Your Twilio Account SID
TWILIO_ACCOUNT_SID=AC...

# Required: Your Twilio Auth Token
TWILIO_AUTH_TOKEN=your_auth_token_here

# Required for SMS: Your Twilio phone number
TWILIO_PHONE_NUMBER=+254712345678

# Required for WhatsApp: Your WhatsApp-enabled Twilio number
# For testing, use sandbox: whatsapp:+14155238886
# For production, use your verified number: whatsapp:+254712345678
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ===== SENDGRID (Twilio Email) =====
# Required: Your SendGrid API Key
SENDGRID_API_KEY=SG.your_api_key_here

# Required: Verified sender email
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Optional: Sender name
SENDGRID_FROM_NAME=MyGF AI

# ===== FRONTEND URL (for links in messages) =====
FRONTEND_URL=https://your-app.onrender.com
```

### For Render Deployment:
1. Go to your service on [Render Dashboard](https://dashboard.render.com/)
2. Click on **Environment** tab
3. Add each variable above
4. Click **Save Changes**
5. Render will automatically redeploy

---

## 💰 Cost Estimates

### SMS (Kenya - KE)
- Outbound SMS: ~KSh 1.50 per message ($0.01 USD)
- Monthly phone number: $1.00

**Example monthly cost:**
- 1000 messages/month = $10 + $1 number = **$11/month**

### WhatsApp Business
- Inbound (customer → you): FREE
- Outbound (you → customer): ~$0.005 - $0.02 per message
- No phone number cost

**Example monthly cost:**
- 1000 messages/month = **$5-$20/month**

### SendGrid Email
- First 100 emails/day: **FREE**
- 40,000 emails/month: $19.95
- 100,000 emails/month: $89.95

**Example monthly cost:**
- Up to 3,000 emails/month = **$0 (FREE)**
- 10,000 emails/month = ~**$20/month**

### Total Estimated Cost (for 1000 users)
- **Testing:** $0 (trial credits)
- **Small scale (100 messages/day):** ~$15/month
- **Medium scale (1000 messages/day):** ~$50-100/month
- **Large scale (10,000 messages/day):** ~$500-1000/month

---

## ✅ Testing the Integration

### Test 1: Check Configuration
```bash
curl https://your-api.com/api/twilio/health
```

Expected response:
```json
{
  "success": true,
  "twilio": {
    "configured": true,
    "smsNumber": "***configured***",
    "whatsappNumber": "***configured***"
  },
  "sendgrid": {
    "configured": true,
    "fromEmail": "noreply@yourdomain.com"
  }
}
```

### Test 2: Send Test SMS
```bash
curl -X POST https://your-api.com/api/twilio/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "sms",
    "phone": "+254712345678"
  }'
```

### Test 3: Send Test WhatsApp
```bash
curl -X POST https://your-api.com/api/twilio/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "phone": "+254712345678"
  }'
```

### Test 4: Send Test Email
```bash
curl -X POST https://your-api.com/api/twilio/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "email": "your-email@gmail.com"
  }'
```

### Test 5: Multi-Channel Test
```bash
curl -X POST https://your-api.com/api/twilio/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "multi",
    "phone": "+254712345678",
    "email": "your-email@gmail.com"
  }'
```

---

## 🔧 Troubleshooting

### Issue: "Twilio not configured"
**Solution:** Check that `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are set correctly.

```bash
# Verify environment variables
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
```

### Issue: "SMS sender number not configured"
**Solution:** Set `TWILIO_PHONE_NUMBER` with your purchased Twilio number.

### Issue: "WhatsApp number not configured"
**Solution:**
- For testing: Use `whatsapp:+14155238886` (Twilio sandbox)
- For production: Set up WhatsApp Business API and use `whatsapp:+yourNumber`

### Issue: "SendGrid not configured"
**Solution:** Check that `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set and email is verified.

### Issue: Messages not being delivered
**Possible causes:**
1. **Phone number format:** Must include country code (+254 for Kenya)
2. **Trial account:** Can only send to verified numbers
3. **WhatsApp sandbox:** User must opt-in by sending message to sandbox
4. **Email not verified:** Verify sender email in SendGrid
5. **Insufficient credits:** Check Twilio balance

**Check logs:**
```bash
# In your application logs, look for:
✅ SMS sent to +254... SID: SM...
❌ SMS failed: [error message]
```

### Issue: High costs
**Solutions:**
1. Use multi-channel fallback (WhatsApp is cheapest)
2. Batch notifications
3. Set rate limits
4. Use SendGrid for less urgent communications (cheaper)
5. Implement user preferences (opt-out options)

---

## 📱 Integration Points in Your App

The Twilio service is automatically used for:

1. **Lead Notifications** → Agent/Owner gets SMS/WhatsApp/Email
2. **Viewing Confirmations** → Client gets confirmation
3. **Rent Reminders** → Tenants get payment reminders
4. **Maintenance Updates** → Property owners/tenants get updates
5. **Property Alerts** → New property notifications
6. **Welcome Messages** → New user onboarding

All notifications use **multi-channel fallback**:
- Try WhatsApp first (cheapest, richest features)
- Fall back to SMS if WhatsApp fails
- Fall back to Email if SMS fails

---

## 🎓 Quick Start Summary

### For Testing (FREE):
1. Sign up at twilio.com
2. Get Account SID and Auth Token
3. Use trial phone number for SMS
4. Use WhatsApp sandbox
5. Sign up for SendGrid (100 emails/day free)
6. Add all env variables
7. Run test commands above

### For Production:
1. Upgrade Twilio account
2. Buy a phone number ($1/month)
3. Apply for WhatsApp Business API
4. Verify domain in SendGrid
5. Set up webhooks for tracking
6. Monitor usage and costs

---

## 📞 Support

- **Twilio Support:** https://support.twilio.com/
- **SendGrid Support:** https://support.sendgrid.com/
- **Twilio Console:** https://console.twilio.com/
- **SendGrid Dashboard:** https://app.sendgrid.com/

---

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
2. Use environment variables for all secrets
3. Rotate API keys every 90 days
4. Set up IP allowlisting in Twilio (optional)
5. Enable two-factor authentication on Twilio account
6. Monitor webhook requests for suspicious activity
7. Implement rate limiting on your endpoints

---

**Need help?** Contact your development team or refer to:
- [Twilio Documentation](https://www.twilio.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)
