# WhatsApp Business Setup Guide

## Authorization Status
✅ **Sender Authorized:** My Genesis Fortune
✅ **Phone Number:** +12763238588
✅ **Deep Link:** https://wa.me/12763238588

## Current Configuration

Your WhatsApp Business account is now authorized and ready to use! Here's what's configured:

### Environment Variables (.env)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+12763238588
TWILIO_PHONE_NUMBER=+12763238588
```

## Business Profile Setup

### 1. Upload Profile Logo

To add or update your business profile photo:

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Programmable Messaging > Senders > WhatsApp Senders**
3. Click on your sender: **+12763238588**
4. Scroll down to **Business Profile Information**
5. Click **Select File** for **Profile Photo**
6. Upload your logo (recommended: 640x640px, PNG or JPG)
7. Save changes

**Recommended Logo Specifications:**
- Format: PNG with transparent background (or JPG)
- Size: 640x640 pixels (square)
- Max file size: 5MB
- Content: Your business logo or brand mark

### 2. Update Business Profile Information

Complete these fields in the Twilio Console under Business Profile:

- **Business Name:** My Genesis Fortune
- **Business Description:** Your trusted real estate partner helping you find your perfect property in Kenya. Buy, sell, or rent with confidence.
- **Business Category:** Real Estate
- **Business Address:** [Your physical address]
- **Business Email:** admin@dominicatechnologies.com
- **Business Website:** https://mygenesisfortune.com

## Message Templates for Meta Approval

To send notifications outside the 24-hour messaging window, you must submit message templates to Meta for approval.

### Why Templates Are Required

- **24-Hour Window:** You can send freeform messages within 24 hours of receiving a message from a customer
- **Template Messages:** After 24 hours, you must use pre-approved templates for outbound notifications

### How to Submit Templates

#### Method 1: Via Twilio Console (Recommended)

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: **Messaging > Content Templates**
3. Click **Create new template**
4. Select **WhatsApp** as the channel
5. Fill in template details:
   - **Template Name:** (e.g., `lead_notification`)
   - **Category:** TRANSACTIONAL
   - **Language:** English (en)
   - **Body:** Copy the template body from `backend/config/whatsappTemplates.js`
6. Add variables using `{{1}}`, `{{2}}`, etc.
7. Submit for approval

#### Method 2: Via Twilio API

Use the Twilio Content API to programmatically create templates. See example in `backend/scripts/submitWhatsAppTemplates.js`

### Pre-Defined Templates

We've created 6 templates ready for submission (see `backend/config/whatsappTemplates.js`):

1. **Lead Notification** - Notify agents about new leads
2. **Viewing Confirmation** - Confirm property viewings
3. **Rent Reminder** - Send rent payment reminders
4. **Maintenance Update** - Update on maintenance requests
5. **Welcome Message** - Greet new customers
6. **Payment Confirmation** - Confirm successful payments

### Template Approval Timeline

- **Initial Review:** 1-2 business days
- **Status Check:** Check status in Twilio Console under Content Templates
- **Notifications:** You'll receive an email when templates are approved/rejected

## Messaging Limits & Quality Rating

### Current Limits

- **Tier:** Entry (new sender)
- **Daily Limit:** 250 unique recipients per day
- **Quality Rating:** Maintain "HIGH" quality to upgrade

### Upgrading to Higher Tiers

To increase your messaging limit:

1. **Send Consistent Volume:** Continue sending messages at your typical volume (aim for 250/day)
2. **Maintain Quality:** Keep your quality rating "HIGH"
   - Avoid spam complaints
   - Ensure messages are relevant to recipients
   - Don't send unsolicited messages
   - Include clear opt-out instructions
3. **Pass Review:** Meta will review your account automatically
4. **Display Name Approval:** Once approved, you can add more senders

**Tier Progression:**
- Entry: 250 messages/day (current)
- Tier 1: 1,000 messages/day
- Tier 2: 10,000 messages/day
- Tier 3: 100,000 messages/day
- Unlimited: Case-by-case basis

### Quality Rating Best Practices

✅ **DO:**
- Only message customers who opted in
- Send relevant, timely notifications
- Respond quickly to customer messages
- Use approved templates for notifications
- Keep messages professional and valuable

❌ **DON'T:**
- Send promotional spam
- Message users who haven't consented
- Send the same message repeatedly
- Use misleading information
- Send messages outside business hours excessively

## Testing Your Setup

### Test the Integration

Use the test interface at: `test-twilio-creds.html`

Or test via API:
```bash
curl -X POST http://localhost:5000/api/twilio/test?channel=whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254700000000"
  }'
```

### Health Check

```bash
curl http://localhost:5000/api/twilio/health
```

Expected response:
```json
{
  "twilio": {
    "configured": true,
    "smsNumber": "***configured***",
    "whatsappNumber": "***configured***"
  },
  "sendgrid": {
    "configured": true,
    "fromEmail": "admin@dominicatechnologies.com"
  }
}
```

## Webhook Configuration

### Inbound Messages Webhook

Configure in Twilio Console:

1. Go to your WhatsApp Sender: **+12763238588**
2. Set **"When a message comes in"** to:
   ```
   https://genesis-hezn.onrender.com/api/twilio/inbound
   ```
   Method: POST

3. Set **Fallback URL** to:
   ```
   https://genesis-hezn.onrender.com/api/twilio/inbound-fallback
   ```

### Status Callback Webhook

1. In Twilio Console, go to **Messaging > Settings > WhatsApp Sender**
2. Set **Status Callback URL** to:
   ```
   https://genesis-hezn.onrender.com/api/twilio/status
   ```

This tracks message delivery status (sent, delivered, failed, etc.)

## Using the Deep Link

Your WhatsApp deep link allows customers to start a conversation with you directly:

**Link:** https://wa.me/12763238588

### Where to Use It

- Website "Contact Us" button
- Email signatures
- Social media profiles
- Property listings
- Marketing materials
- QR codes (generate at https://wa.me/12763238588?qr=1)

### Custom Message Link

Add a pre-filled message:
```
https://wa.me/12763238588?text=Hi%2C%20I'm%20interested%20in%20property%20%23123
```

## Monitoring & Analytics

### Message Logs

View message logs in Twilio Console:
1. Go to **Monitor > Logs > Messaging**
2. Filter by your WhatsApp number
3. Check delivery status, error codes, etc.

### Key Metrics to Track

- **Delivery Rate:** % of messages successfully delivered
- **Response Rate:** % of customers who respond
- **Quality Rating:** Check weekly in Twilio Console
- **Daily Volume:** Track against your tier limit

## Troubleshooting

### Common Issues

**Issue:** Messages not sending
- Check: Twilio credentials in .env
- Check: Phone number format (must include country code with +)
- Check: Quality rating is not "LOW"

**Issue:** "Template not found" error
- Check: Template is approved in Twilio Console
- Check: Using correct template SID/name
- Check: Variables match template definition

**Issue:** Quality rating dropped
- Review: Recent message content
- Check: User complaints/blocks
- Ensure: Only messaging opted-in users

### Support Resources

- **Twilio Support:** https://support.twilio.com
- **WhatsApp Business Policy:** https://www.whatsapp.com/legal/business-policy
- **Twilio WhatsApp Docs:** https://www.twilio.com/docs/whatsapp

## Next Steps

1. ✅ Upload business profile logo
2. ✅ Complete business profile information
3. ✅ Submit message templates for approval
4. ✅ Configure webhooks (if not already done)
5. ✅ Test sending messages
6. ✅ Monitor quality rating
7. ✅ Gradually increase messaging volume to reach 250/day

---

**Need Help?** Check `backend/services/` for implementation details or contact your development team.
