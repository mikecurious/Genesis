# Gmail API Setup Guide for Email Inquiry Tracking

This guide will help you set up Gmail API integration for your Genesis application to track inbound email inquiries from potential clients.

## Overview

The Gmail integration allows your application to:
- Automatically detect when clients email your agents
- Extract property references and contact information
- Create or update leads in your system
- Send notifications to agents via their preferred channels
- Track all email interactions in the lead timeline

## Prerequisites

- Google Workspace (formerly G Suite) account
- Access to Google Cloud Console
- Node.js application with googleapis package installed

---

## Step 1: Install Required Packages

Add the googleapis package to your project:

```bash
cd backend
npm install googleapis
```

---

## Step 2: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Genesis Email Tracking`
4. Click **"Create"**

---

## Step 3: Enable Gmail API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"**
4. Click **"Enable"**

---

## Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"Internal"** (for Google Workspace) or **"External"** (for testing)
3. Fill in the required fields:
   - **App name**: Genesis Real Estate Platform
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. On **"Scopes"** page:
   - Click **"Add or Remove Scopes"**
   - Add these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly` (Read emails)
     - `https://www.googleapis.com/auth/gmail.modify` (Mark as read)
     - `https://www.googleapis.com/auth/gmail.metadata` (Access email metadata)
   - Click **"Update"** → **"Save and Continue"**
6. Click **"Save and Continue"** through remaining steps

---

## Step 5: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Configure:
   - **Name**: Genesis Gmail Integration
   - **Authorized redirect URIs**: Add `http://localhost:3000/auth/gmail/callback`
5. Click **"Create"**
6. **IMPORTANT**: Save the **Client ID** and **Client Secret** - you'll need these

---

## Step 6: Generate Refresh Token

You need to generate a refresh token to access Gmail programmatically. Run this one-time setup:

1. Create a file `backend/scripts/gmail-auth.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/auth/gmail/callback';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.metadata'
];

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
});

console.log('Authorize this app by visiting this URL:');
console.log(authUrl);
console.log('\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the authorization code from the URL: ', async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n✅ Tokens received!');
        console.log('\nAdd these to your .env file:');
        console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    } catch (error) {
        console.error('Error getting tokens:', error);
    }
    rl.close();
});
```

2. Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with your values

3. Run the script:
```bash
node scripts/gmail-auth.js
```

4. Open the URL displayed in your browser
5. Sign in with your Google Workspace account
6. Grant permissions
7. Copy the code from the redirect URL (after `code=`)
8. Paste it into the terminal
9. Copy the generated environment variables

---

## Step 7: Update Environment Variables

Add these to your `backend/.env` file:

```env
# Gmail API Configuration
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_here

# Optional: For Gmail Push Notifications (Advanced)
GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT_ID/topics/gmail-push
```

---

## Step 8: Test Gmail Integration

### Manual Poll Test

1. Start your backend server:
```bash
npm start
```

2. Send a test email to your agent's email address with a property reference

3. Trigger manual polling via API:
```bash
curl -X POST http://localhost:5000/api/emails/gmail-poll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. Check the logs - you should see:
```
📧 Polling Gmail for new emails...
Found X new emails to process
✅ Processed X Gmail messages
```

5. Check your database - a new lead should be created

### Automatic Polling

The system automatically polls Gmail every 5 minutes. You can adjust this in `server.js`:

```javascript
// Change '*/5 * * * *' to your preferred schedule
// Examples:
// '*/1 * * * *'  - Every minute
// '*/10 * * * *' - Every 10 minutes
// '0 * * * *'    - Every hour
cron.schedule('*/5 * * * *', async () => {
    // Polling logic
});
```

---

## Step 9: (Optional) Set Up Push Notifications

For real-time email processing instead of polling:

### Create Pub/Sub Topic

1. Enable **Cloud Pub/Sub API** in Google Cloud Console
2. Go to **Pub/Sub** → **Topics**
3. Click **"Create Topic"**
4. Name: `gmail-push`
5. Click **"Create"**

### Grant Gmail Permission

1. Add this service account as a publisher:
   - Email: `gmail-api-push@system.gserviceaccount.com`
   - Role: **Pub/Sub Publisher**

### Configure Watch

The application will automatically set up watch when it starts. You can also manually trigger it:

```javascript
// In your code or via API endpoint
await gmailService.watchInbox('me');
```

### Update Environment Variable

```env
GMAIL_PUBSUB_TOPIC=projects/YOUR_PROJECT_ID/topics/gmail-push
```

---

## How It Works

### Email Flow

1. **Client sends email** to agent@yourdomain.com
2. **Gmail receives** the email
3. **Polling cron job** (every 5 minutes) checks for new emails
4. **Email parsed** and analyzed for:
   - Property references (ID, title, etc.)
   - Client contact information
   - Buying intent signals (keywords like "buy", "viewing", "budget")
5. **Lead created or updated** with:
   - Interaction type: `email_inquiry`
   - Interaction source: `email`
   - AI intent analysis
6. **Agent notified** via preferred channels (SMS, WhatsApp, Email, In-app)
7. **Email marked as read** to avoid duplicate processing

### Property Matching

The system looks for property references in:
- **Subject line** or **email body** containing:
  - Property ID: `#property_id` or `property/property_id`
  - Property title: In quotes like `"3BR Apartment Westlands"`
  - Property URLs from your platform

---

## Troubleshooting

### Issue: "Gmail API not initialized"

**Solution**: Check that all environment variables are set correctly in `.env`

### Issue: "Token has been expired or revoked"

**Solution**: Generate a new refresh token using the `gmail-auth.js` script

### Issue: "No emails being processed"

**Possible causes**:
1. No new unread emails in last hour
2. Emails don't reference any properties
3. Gmail API quota exceeded (check Google Cloud Console)

**Debug steps**:
```bash
# Check if Gmail API is working
curl -X POST http://localhost:5000/api/emails/gmail-poll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check server logs for errors
tail -f logs/combined.log | grep Gmail
```

### Issue: "Duplicate leads being created"

**Solution**: The system uses `client.email + property` as unique identifier. If duplicates occur, check that email parsing is extracting the correct sender email.

---

## Best Practices

### 1. Email Format for Clients

Educate agents to ask clients to include property references in emails:

```
Subject: Inquiry about 3BR Apartment in Westlands

Hi [Agent Name],

I'm interested in viewing the 3 bedroom apartment in Westlands
that I saw on your website (Property #123456).

Contact me at: +254712345678

Thank you!
```

### 2. Polling Frequency

- **Development**: Every 1-2 minutes for testing
- **Production**: Every 5-10 minutes (balances responsiveness with API quota)
- **High volume**: Set up Push Notifications for real-time processing

### 3. Monitoring

Monitor Gmail API usage in Google Cloud Console:
- Go to **APIs & Services** → **Dashboard**
- Check **Gmail API** usage
- Free tier: 1 billion quota units/day (plenty for most use cases)

### 4. Security

- **Never commit** `.env` file with credentials
- Use **service accounts** for production
- Rotate refresh tokens periodically
- Monitor API access logs

---

## Migration from SendGrid

If you're switching from SendGrid to Gmail:

1. Both webhook endpoints can run simultaneously
2. SendGrid endpoint: `/api/emails/inbound-webhook`
3. Gmail polling: Runs automatically every 5 minutes
4. No code changes needed in frontend
5. Both use the same `emailInquiryService` backend

---

## Support

For issues or questions:
- Check logs: `backend/logs/combined.log`
- Gmail API docs: https://developers.google.com/gmail/api
- Google Workspace support: https://workspace.google.com/support

---

## Summary

✅ Gmail API enabled in Google Cloud Console
✅ OAuth credentials created (Client ID, Secret)
✅ Refresh token generated and added to `.env`
✅ Application polls Gmail every 5 minutes
✅ Email inquiries automatically create leads
✅ Agents notified via preferred channels

Your Gmail integration is now complete! Clients can email your agents directly, and the system will automatically track all inquiries as leads with AI-powered intent analysis.
