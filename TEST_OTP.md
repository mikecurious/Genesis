# Testing OTP to Your Number: +254758930908

## Quick Test Commands

### Option 1: Using curl (Command Line)

#### Test 1: Send OTP via SMS
```bash
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254758930908",
    "channel": "sms"
  }'
```

#### Test 2: Send OTP via WhatsApp (if you've joined the sandbox)
```bash
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254758930908",
    "channel": "whatsapp"
  }'
```

#### Test 3: Multi-Channel (tries WhatsApp, falls back to SMS)
```bash
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254758930908",
    "channel": "multi"
  }'
```

---

## Expected Response

### Success Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": "5 minutes",
  "otp": "123456"  // Only shown in development mode
}
```

### Your Phone Will Receive:
```
Your MyGF AI verification code is: 123456

This code will expire in 5 minutes.

If you didn't request this code, please ignore this message.
```

---

## Verify the OTP

Once you receive the OTP on your phone:

```bash
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254758930908",
    "otp": "123456"
  }'
```

**Replace `123456` with the actual OTP you received**

### Success Response:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Failed Response:
```json
{
  "success": false,
  "error": "Invalid OTP. 2 attempts remaining."
}
```

---

## Resend OTP

If you didn't receive it or it expired:

```bash
curl -X POST http://localhost:5000/api/otp/resend \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254758930908"
  }'
```

---

## Option 2: Using Browser/Postman

### Send OTP
- **Method:** POST
- **URL:** `http://localhost:5000/api/otp/send`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "phone": "+254758930908",
  "channel": "sms"
}
```

### Verify OTP
- **Method:** POST
- **URL:** `http://localhost:5000/api/otp/verify`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "phone": "+254758930908",
  "otp": "123456"
}
```

---

## After Deploying to Render

Replace `http://localhost:5000` with your Render URL:

```bash
curl -X POST https://your-app.onrender.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254758930908",
    "channel": "sms"
  }'
```

---

## Troubleshooting

### "Twilio not configured"
- Make sure you added `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to your `.env`
- Restart your backend server after adding env variables

### "SMS sender number not configured"
- Add `TWILIO_PHONE_NUMBER` to your `.env`
- Format: `+14155551234` (your Twilio number)

### "Trial account limitations"
- If using Twilio trial, you must verify `+254758930908` in Twilio Console first
- Go to: https://console.twilio.com/
- Navigate to: Phone Numbers → Manage → Verified Caller IDs
- Click "Add a new Caller ID" and verify your number

### Message not received
- Check if the number is formatted correctly: `+254758930908` ✅
- Without the + sign won't work: `254758930908` ❌
- Check your Twilio console logs for delivery status

---

## Testing Locally

1. **Start your backend:**
```bash
cd backend
npm run dev
```

2. **In another terminal, run the test:**
```bash
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+254758930908", "channel": "sms"}'
```

3. **Check your phone** for the OTP

4. **Verify it:**
```bash
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+254758930908", "otp": "THE_CODE_YOU_RECEIVED"}'
```

---

## What Happens Behind the Scenes

1. **Send Request** → Server generates 6-digit OTP
2. **OTP Stored** → Saved in memory with 5-minute expiry
3. **Twilio Called** → Sends SMS to +254758930908
4. **You Receive** → SMS arrives on your phone
5. **You Enter OTP** → Send verification request
6. **Server Checks** → Validates OTP and expiry
7. **Success** → OTP is deleted after successful verification

---

## Security Features

✅ **5-minute expiry** - OTPs auto-expire
✅ **3 attempt limit** - Prevents brute force
✅ **Single use** - OTP deleted after verification
✅ **Auto cleanup** - Expired OTPs cleaned every minute

---

## Cost Per OTP

- **SMS:** ~$0.01 USD (~KSh 1.50)
- **WhatsApp:** ~$0.005 USD (~KSh 0.75)

**Tip:** Use multi-channel mode to try WhatsApp first (cheaper!)

---

## Quick Test Script

Save this as `test-otp.sh`:

```bash
#!/bin/bash

echo "🧪 Testing OTP to +254758930908..."
echo ""

# Send OTP
echo "📤 Sending OTP..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+254758930908", "channel": "sms"}')

echo "$RESPONSE" | jq '.'

# Extract OTP if in development mode
OTP=$(echo "$RESPONSE" | jq -r '.otp // empty')

if [ ! -z "$OTP" ]; then
  echo ""
  echo "🔑 OTP Generated: $OTP"
  echo ""
  echo "✅ Check your phone for the SMS!"
  echo ""
  echo "To verify, run:"
  echo "curl -X POST http://localhost:5000/api/otp/verify \\"
  echo "  -H 'Content-Type: application/json' \\"
  echo "  -d '{\"phone\": \"+254758930908\", \"otp\": \"$OTP\"}'"
fi
```

Make it executable and run:
```bash
chmod +x test-otp.sh
./test-otp.sh
```

---

**Ready to test? Run the curl command above and check your phone! 📱**
