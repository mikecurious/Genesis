# Twilio Integration - Quick Start

## 🎯 What I Need From You

### For Testing (FREE - Can start immediately)
1. **Go to:** https://www.twilio.com/try-twilio
2. **Sign up** for free trial
3. **Get these credentials:**
   ```
   Account SID: AC...
   Auth Token: (click "Show" in console)
   Trial Phone Number: +1415...
   ```
4. **For WhatsApp Sandbox:**
   - Go to Messaging → Try WhatsApp
   - Send message to sandbox number to activate
   - Use: `whatsapp:+14155238886`

5. **For SendGrid (Email):**
   - Go to: https://sendgrid.com/
   - Sign up (100 emails/day FREE)
   - Get API Key from Settings → API Keys
   - Verify your sender email

### For Production
1. **Upgrade Twilio account** (add payment method)
2. **Buy a phone number** for SMS ($1/month)
   - Go to Phone Numbers → Buy a Number
   - Select Kenya (+254) or your country
   - Enable SMS capability
3. **Apply for WhatsApp Business API** (optional, 1-2 weeks approval)
4. **Verify your domain** in SendGrid for better deliverability

---

## 🔐 Environment Variables You Need to Set on Render

Add these to your Render service **Environment** tab:

```bash
# ===== TWILIO =====
TWILIO_ACCOUNT_SID=AC...your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here

# For SMS (after buying a number)
TWILIO_PHONE_NUMBER=+254712345678

# For WhatsApp (testing: use sandbox, production: your verified number)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ===== SENDGRID (Email) =====
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=MyGF AI
```

---

## 💰 Costs

### Testing (FREE)
- Trial credit: $15.50
- SendGrid: 100 emails/day forever

### Production Monthly Costs
- **SMS:** ~$0.01 per message + $1/month for number
- **WhatsApp:** ~$0.005 per message (no monthly fee)
- **Email:** First 100/day FREE, then $19.95 for 40k/month

**Example:** 1000 messages/month = ~$15-30/month total

---

## ✅ How to Test

### Test in Browser Console
1. Go to: `https://your-app.onrender.com/api/twilio/health`
2. Should see:
   ```json
   {
     "success": true,
     "twilio": { "configured": true },
     "sendgrid": { "configured": true }
   }
   ```

### Send Test Message
```bash
curl -X POST https://your-app.onrender.com/api/twilio/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "phone": "+254712345678"
  }'
```

Or test all channels at once:
```bash
curl -X POST https://your-app.onrender.com/api/twilio/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "multi",
    "phone": "+254712345678",
    "email": "your@email.com"
  }'
```

---

## 🚀 What's Already Integrated

Twilio is now automatically used for:
- ✅ Lead notifications (SMS/WhatsApp/Email to agents)
- ✅ Viewing confirmations (to clients)
- ✅ Rent reminders (to tenants)
- ✅ Maintenance updates (to owners/tenants)
- ✅ Property alerts
- ✅ Welcome messages

**Smart Fallback:** Tries WhatsApp first → SMS if failed → Email if both failed

---

## 📱 Where It's Used

Every place in your app that uses email/SMS/WhatsApp now uses Twilio:

1. **In-app email modal** → Falls back to SendGrid
2. **Lead capture forms** → Sends multi-channel notifications
3. **Viewing scheduler** → Sends confirmations
4. **Rent reminders** → Automated monthly reminders
5. **Maintenance requests** → Status updates

---

## 🆘 Quick Troubleshooting

**"Twilio not configured"**
→ Check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are set

**"SMS sender number not configured"**
→ Set `TWILIO_PHONE_NUMBER` with your bought number

**"WhatsApp number not configured"**
→ Use sandbox: `whatsapp:+14155238886` (don't forget the `whatsapp:` prefix!)

**Messages not delivered**
→ Phone numbers must include country code: `+254712345678`
→ For trial: Can only send to numbers you verify in Twilio console

---

## 📚 Full Documentation

For complete setup guide, see: **[TWILIO_INTEGRATION_GUIDE.md](./TWILIO_INTEGRATION_GUIDE.md)**

---

## ⏱️ Setup Time Estimate

- **Testing setup:** 15 minutes
- **Production setup:** 30 minutes
- **WhatsApp Business:** 1-2 weeks (verification)

---

## 🎓 Next Steps

1. Create Twilio trial account → Get credentials
2. Sign up for SendGrid → Get API key
3. Add all environment variables to Render
4. Test using the curl commands above
5. Monitor usage in Twilio/SendGrid dashboards
6. Upgrade to paid account when ready

**Need help?** Check the full integration guide or Twilio support!
