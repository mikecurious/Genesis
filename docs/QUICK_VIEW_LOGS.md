# 🚀 QUICK GUIDE: View OTP in Render Logs

## Option 1: Web Dashboard (Fastest)

### 📍 Direct Link to Your Logs:
```
https://dashboard.render.com/web/srv-cs94dhbuvlqc738rrv80/logs
```

**Just click that link!** ☝️

### What to Look For:
When someone registers, you'll see:
```
--- ACCOUNT VERIFICATION (Email Failed) ---
User: user@example.com
OTP: 123456
--------------------------
```

---

## Option 2: Test It Right Now

### Run this command:
```bash
cd backend
./test-registration.sh
```

This will:
1. Prompt you to open logs page
2. Create a test user
3. Generate OTP
4. You see it in real-time in logs!

---

## Option 3: Manual User Verification (No OTP Needed)

If you just want to verify a user without getting OTP:

```bash
cd backend
node verify-user.js user@example.com
```

Done! User is verified instantly.

---

## 📊 Current Database Status

Run this anytime to see all users:
```bash
cd backend
node check-db.js
```

Shows:
- Total users: 7
- Verified users
- Unverified users (with OTP status)
- All collections

---

## 🎯 Your Links

| Service | URL |
|---------|-----|
| Backend | https://genesis-hezn.onrender.com |
| Frontend | https://genesis-1-wxpr.onrender.com |
| Logs | https://dashboard.render.com/web/srv-cs94dhbuvlqc738rrv80/logs |
| MongoDB | https://cloud.mongodb.com |

---

## 💡 Pro Tip

Keep the logs page open while testing:
- Auto-refreshes every few seconds
- Search box filters in real-time
- Download logs if needed

**Remember**: OTPs also appear in the API response if email fails!
