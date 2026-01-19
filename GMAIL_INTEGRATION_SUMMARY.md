# Gmail Integration Summary

## ✅ Implementation Complete!

Your Genesis application now supports **Google Workspace Gmail** as an alternative to SendGrid for tracking email inquiries from clients.

---

## What Was Implemented

### 1. **Gmail API Service** (`backend/services/gmailService.js`)
   - Full Gmail API integration
   - OAuth 2.0 authentication
   - Email reading and parsing
   - Mark as read functionality
   - Push notification support (optional)
   - Automatic polling for new emails

### 2. **Enhanced Email Inquiry Service** (`backend/services/emailInquiryService.js`)
   - Support for both SendGrid webhooks AND Gmail polling
   - Gmail message parsing
   - Automatic Gmail polling method
   - Marks processed emails as read

### 3. **API Endpoints** (`backend/routes/email.js`, `backend/controllers/email.js`)
   - `POST /api/emails/gmail-webhook` - Receives Gmail push notifications
   - `POST /api/emails/gmail-poll` - Manually trigger email polling (for testing)

### 4. **Automatic Email Polling** (`backend/server.js`)
   - Cron job runs every 5 minutes
   - Fetches unread emails from last hour
   - Processes and creates leads automatically
   - Marks emails as read after processing

### 5. **Documentation** (`backend/docs/GMAIL_SETUP.md`)
   - Complete step-by-step setup guide
   - Google Cloud Console configuration
   - OAuth credentials generation
   - Troubleshooting tips

### 6. **Authentication Script** (`backend/scripts/gmail-auth.js`)
   - Easy-to-use script for generating refresh tokens
   - Interactive terminal interface
   - Automatic .env configuration output

---

## How It Works

### Email Flow with Gmail

```
Client sends email to agent@yourdomain.com
          ↓
Gmail receives and stores email
          ↓
Cron job polls Gmail every 5 minutes
          ↓
New emails fetched and parsed
          ↓
Property reference extracted from subject/body
          ↓
AI analyzes email for buying intent
          ↓
Lead created or updated with email_inquiry interaction
          ↓
Agent notified via preferred channels (SMS, WhatsApp, Email, In-app)
          ↓
Email marked as read
```

---

## Setup Steps (Quick Reference)

1. **Install googleapis package** (if not already):
   ```bash
   cd backend
   npm install googleapis
   ```

2. **Google Cloud Console Setup**:
   - Create project
   - Enable Gmail API
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials

3. **Generate Refresh Token**:
   ```bash
   node scripts/gmail-auth.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET
   ```

4. **Add to .env**:
   ```env
   GMAIL_CLIENT_ID=your_client_id_here
   GMAIL_CLIENT_SECRET=your_client_secret_here
   GMAIL_REFRESH_TOKEN=your_refresh_token_here
   ```

5. **Restart Server**:
   ```bash
   npm start
   ```

6. **Test**:
   - Send test email to your agent's address
   - Wait 5 minutes OR manually trigger: `POST /api/emails/gmail-poll`
   - Check logs for processing confirmation
   - Verify lead created in database

---

## Key Features

### ✅ Automatic Processing
- Polls Gmail every 5 minutes (configurable)
- No manual intervention needed
- Processes up to 50 emails per poll

### ✅ Smart Parsing
- Extracts sender email and contact info
- Identifies property references
- Analyzes email body for intent signals

### ✅ AI Intent Analysis
- Detects urgency levels (low, medium, high)
- Identifies buying signals (keywords: buy, purchase, viewing, etc.)
- Calculates engagement score

### ✅ Lead Management
- Creates new leads automatically
- Updates existing leads with email interactions
- Tracks all email history in lead timeline

### ✅ Agent Notifications
- Multi-channel alerts (SMS, WhatsApp, Email, In-app)
- Respects agent preferences
- Includes lead score and buying intent

### ✅ No Duplicates
- Marks emails as read after processing
- Unique constraint: client email + property
- Prevents duplicate lead creation

---

## Gmail vs SendGrid Comparison

| Feature | Gmail API | SendGrid Webhook |
|---------|-----------|------------------|
| **Cost** | Free (1B quota/day) | Paid plans |
| **Setup** | OAuth + Google Cloud | Inbound Parse setup |
| **Real-time** | 5-min polling OR push | Instant webhook |
| **Your Account** | ✅ Use your own | ❌ Need SendGrid account |
| **Control** | ✅ Full access to inbox | ❌ Forwarding only |
| **Testing** | ✅ Easy manual trigger | ⚠️ Need test emails |

---

## Configuration Options

### Polling Frequency

Edit `backend/server.js` to change polling interval:

```javascript
// Current: Every 5 minutes
cron.schedule('*/5 * * * *', async () => { ... });

// Options:
cron.schedule('*/1 * * * *', ...);  // Every minute
cron.schedule('*/10 * * * *', ...); // Every 10 minutes
cron.schedule('0 * * * *', ...);    // Every hour
```

### Gmail API Scopes

Currently using:
- `gmail.readonly` - Read emails
- `gmail.modify` - Mark as read
- `gmail.metadata` - Access headers

You can reduce permissions if needed (see setup guide).

---

## Testing

### Manual Poll Test

```bash
# With authenticated request
curl -X POST http://localhost:5000/api/emails/gmail-poll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Check Logs

```bash
# Monitor Gmail processing
tail -f backend/logs/combined.log | grep Gmail

# Expected output:
# 📧 Polling Gmail for new emails...
# Found 2 new emails to process
# Processing Gmail message: 18f1a2b3c4d5e6f7
# ✅ Processed 2 Gmail messages
```

### Verify Lead Creation

```javascript
// In MongoDB or via API
db.leads.find({ 'aiEngagement.aiActions.interactionType': 'email_inquiry' })
```

---

## Advanced: Push Notifications

For real-time processing instead of polling:

1. **Enable Cloud Pub/Sub** in Google Cloud
2. **Create topic**: `projects/YOUR_PROJECT_ID/topics/gmail-push`
3. **Grant permissions** to `gmail-api-push@system.gserviceaccount.com`
4. **Add to .env**: `GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT_ID/topics/gmail-push`
5. **Gmail webhook** receives instant notifications
6. **No polling needed** - real-time processing

See full guide: `backend/docs/GMAIL_SETUP.md` (Step 9)

---

## Troubleshooting

### Issue: "Gmail API not initialized"
- Check all env vars are set in `.env`
- Restart server
- Check logs for initialization errors

### Issue: "Token expired"
- Run `node scripts/gmail-auth.js` again
- Generate new refresh token
- Update `.env` with new token

### Issue: "No emails processed"
- Check if there are unread emails
- Verify emails mention properties
- Check Gmail API quota in Google Cloud Console
- Try manual poll: `POST /api/emails/gmail-poll`

### Issue: "Duplicate leads"
- System uses `client.email + property` as unique key
- Check email parsing is extracting correct sender
- Verify database indexes are created

---

## Security Best Practices

1. ✅ **Never commit** `.env` file
2. ✅ **Use service accounts** in production
3. ✅ **Rotate tokens** periodically (every 6 months)
4. ✅ **Monitor** API usage in Google Cloud Console
5. ✅ **Limit scopes** to minimum required
6. ✅ **Enable 2FA** on Google Workspace account

---

## Migration Notes

### From SendGrid to Gmail

Both can run simultaneously:
- SendGrid webhook: Instant processing
- Gmail polling: Processes every 5 minutes
- No conflicts - different endpoints
- Same backend service handles both

### Switching Completely to Gmail

1. Remove SendGrid webhook configuration
2. Gmail polling continues working
3. All features remain functional
4. Cheaper if you have Google Workspace

---

## Files Modified/Created

### Created:
- `backend/services/gmailService.js` - Gmail API wrapper
- `backend/scripts/gmail-auth.js` - Token generation script
- `backend/docs/GMAIL_SETUP.md` - Complete setup guide
- `GMAIL_INTEGRATION_SUMMARY.md` - This file

### Modified:
- `backend/services/emailInquiryService.js` - Added Gmail support
- `backend/controllers/email.js` - Added Gmail endpoints
- `backend/routes/email.js` - Added Gmail routes
- `backend/server.js` - Added Gmail initialization & cron
- `backend/.env.example` - Added Gmail variables

---

## Next Steps

1. **Follow setup guide**: `backend/docs/GMAIL_SETUP.md`
2. **Run auth script**: `node scripts/gmail-auth.js`
3. **Add env variables**: Copy to `.env`
4. **Test with real email**: Send to your agent
5. **Monitor logs**: Check processing works
6. **Adjust polling**: Change frequency if needed

---

## Support

For detailed setup instructions, see:
- **Setup Guide**: `backend/docs/GMAIL_SETUP.md`
- **Gmail API Docs**: https://developers.google.com/gmail/api
- **Google Cloud Console**: https://console.cloud.google.com/

---

## Summary

✅ **Gmail API fully integrated**
✅ **Automatic email polling every 5 minutes**
✅ **AI-powered intent analysis**
✅ **Multi-channel agent notifications**
✅ **Works alongside or instead of SendGrid**
✅ **Complete documentation provided**
✅ **Easy setup with included scripts**

Your Genesis application now has powerful email inquiry tracking using your own Google Workspace account! 🎉
