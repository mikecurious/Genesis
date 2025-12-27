# How to View Render Logs & See OTPs

## Method 1: Render Dashboard (Easiest)

### Step-by-Step:
1. **Go to**: https://dashboard.render.com
2. **Sign in** with your Render account
3. **Select your backend service** (genesis-hezn)
4. **Click "Logs" tab** at the top

### What You'll See:
When a user registers, logs will show:
```
--- ACCOUNT VERIFICATION (Email Failed) ---
User: user@example.com
OTP: 123456
--------------------------
```

### Features:
- ✅ Real-time log streaming
- ✅ Search/filter logs
- ✅ Download logs as file
- ✅ Last 7 days of logs retained

### Tips:
- Search for "OTP" to find verification codes
- Search for specific email addresses
- Logs auto-refresh every few seconds

---

## Method 2: Render CLI (For Power Users)

### Installation:
```bash
# Install Render CLI globally
npm install -g render-cli

# Or using curl
curl -L https://render.com/install | sh
```

### Setup:
```bash
# Login to Render
render login

# List your services
render services list

# Get service ID from the list
```

### View Logs:
```bash
# Tail logs (live stream)
render logs tail <service-id>

# View last 100 lines
render logs tail <service-id> --lines 100

# Filter logs by text
render logs tail <service-id> | grep "OTP"
render logs tail <service-id> | grep "user@example.com"
```

### Common Commands:
```bash
# View specific service logs
render logs tail srv-XXXXXXXXX

# Follow logs in real-time
render logs tail srv-XXXXXXXXX --follow

# Get logs from last hour
render logs tail srv-XXXXXXXXX --since 1h
```

---

## Method 3: Manual OTP Retrieval Scripts

If you miss the OTP in logs, use these scripts:

### 1. Check Database for Unverified Users:
```bash
cd backend
node check-db.js
```

Shows all unverified users and their status.

### 2. Manually Verify User (Skip OTP):
```bash
cd backend
node verify-user.js user@example.com
```

Instantly verifies the user without needing OTP.

### 3. Check Specific User:
```bash
cd backend
node get-user-otp.js user@example.com
```

Shows user verification status.

---

## Method 4: API Response (During Registration)

When email fails, the registration API returns the OTP:

**Request:**
```bash
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (if email fails):**
```json
{
  "success": true,
  "message": "Registration successful. Verification code: 123456"
}
```

The OTP is included in the message!

---

## Method 5: MongoDB Atlas Logs (Advanced)

### Access MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Sign in with your MongoDB account
3. Select your cluster (Genesis)
4. Click "Activity Feed" or "Monitoring"

### Note:
MongoDB logs show database operations but **not** the OTP values.
Use Render logs for OTPs.

---

## Quick Reference: Where to Find OTPs

| Method | OTP Visibility | Real-time | Difficulty |
|--------|---------------|-----------|------------|
| Render Dashboard Logs | ✅ Plain text | ✅ Yes | ⭐ Easy |
| Render CLI | ✅ Plain text | ✅ Yes | ⭐⭐ Medium |
| API Response | ✅ Plain text | ✅ Yes | ⭐ Easy |
| Database Scripts | ❌ Hashed only | ❌ No | ⭐⭐ Medium |
| Manual Verification | N/A (Bypasses OTP) | ✅ Yes | ⭐ Easy |

---

## Troubleshooting

### Can't Find OTP in Logs?
1. Check if email sent successfully (no "Email Failed" message)
2. If email failed, OTP is in the API response
3. Use `node verify-user.js email@example.com` to manually verify

### OTP Expired?
1. User can request new OTP by re-registering
2. Or manually verify with: `node verify-user.js email@example.com`

### Render Logs Not Loading?
1. Check your internet connection
2. Try refreshing the page
3. Download logs if needed for offline viewing

---

## Pro Tips

### 1. Monitor Logs During Testing
```bash
# Open two terminals:

# Terminal 1: Watch logs
render logs tail srv-XXXXXXXXX --follow

# Terminal 2: Test registration
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'
```

### 2. Save Important Logs
```bash
# Download logs from dashboard
# Or use CLI:
render logs tail srv-XXXXXXXXX --lines 1000 > logs.txt
```

### 3. Quick OTP Lookup
```bash
# Search logs for specific user
render logs tail srv-XXXXXXXXX | grep "user@example.com" -A 3
```

---

## Your Service Details

**Backend URL**: https://genesis-hezn.onrender.com
**Frontend URL**: https://genesis-1-wxpr.onrender.com

To find your service ID:
1. Go to Render Dashboard
2. Click on backend service
3. Service ID is in the URL: `https://dashboard.render.com/web/srv-XXXXXXXXX`

---

## Need Help?

- **Render Support**: https://render.com/docs
- **Render CLI Docs**: https://render.com/docs/cli
- **MongoDB Atlas**: https://cloud.mongodb.com

Remember: OTPs expire in 1 hour, so check logs promptly or use manual verification!
