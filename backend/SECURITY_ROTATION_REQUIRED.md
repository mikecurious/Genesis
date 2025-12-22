# 🚨 CRITICAL: Secret Rotation Required

## ⚠️ EXPOSED CREDENTIALS - ROTATE IMMEDIATELY

The following credentials were exposed in our conversation and **MUST** be rotated before deployment:

---

## 1. MongoDB Database Password

**Status**: 🔴 EXPOSED
**Current**: `My_Genesis` (username: `Genesis`)
**Risk**: Database access, data breach

### How to Rotate:

1. Go to: https://cloud.mongodb.com/
2. Navigate to: **Database Access**
3. Find user: `Genesis`
4. Click: **Edit** → **Edit Password**
5. Generate a strong password (or use this):
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
   ```
6. Update password in MongoDB Atlas
7. Update `MONGO_URI` in `backend/.env`:
   ```
   mongodb+srv://Genesis:NEW_PASSWORD_HERE@genesis.lq4ltrm.mongodb.net/genesis-db?retryWrites=true&w=majority&appName=Genesis
   ```

---

## 2. Gmail App Password

**Status**: 🔴 EXPOSED
**Current**: `xvvr glty thca pdbi`
**Risk**: Email access, spam, phishing

### How to Rotate:

1. Go to: https://myaccount.google.com/apppasswords
2. **Revoke** the current app password
3. Click: **Create** → App: "MyGF AI Backend" → Device: "Server"
4. **Copy** the new 16-character password
5. Update `EMAIL_PASSWORD` in `backend/.env`:
   ```
   EMAIL_PASSWORD=new_app_password_here
   ```

---

## 3. Gemini API Key

**Status**: 🔴 EXPOSED
**Current**: `AIzaSyDQykLOQ6TMWAYNfaA5xmk_8BnfLPG_hxs`
**Risk**: API quota abuse, costs

### How to Rotate:

1. Go to: https://makersuite.google.com/app/apikey
2. Find the exposed key and **DELETE** it
3. Click: **Create API Key**
4. Select your Google Cloud project
5. **Copy** the new key
6. Update `GEMINI_API_KEY` in `backend/.env`:
   ```
   GEMINI_API_KEY=new_api_key_here
   ```

---

## 4. JWT Secret

**Status**: ✅ ALREADY ROTATED
**Current**: Secure 128-character secret
**Action**: No action needed

---

## 🔐 After Rotating All Secrets

### 1. Test Locally

```bash
cd backend

# Test database connection
node -e "require('dotenv').config(); require('./config/db')();"

# Test email
node test-email.js

# Start server and verify
npm run dev
```

### 2. Update Production Environment

If you've already deployed:

1. **Render/Railway/Heroku**: Update environment variables in dashboard
2. **Redeploy** the application
3. **Test** all functionality

### 3. Verify Everything Works

```bash
# Health check
curl https://your-backend.com/api/health

# Test registration (will send email)
curl -X POST https://your-backend.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","phone":"1234567890"}'
```

---

## 📋 Rotation Checklist

- [ ] MongoDB password rotated
- [ ] Gmail app password rotated
- [ ] Gemini API key rotated
- [ ] All new credentials updated in `backend/.env`
- [ ] Tested locally (database, email, API)
- [ ] Production environment updated (if deployed)
- [ ] Application redeployed
- [ ] Verified all features work

---

## 🆘 If You Have Questions

1. MongoDB rotation issues: https://www.mongodb.com/docs/atlas/security-add-mongodb-users/
2. Gmail app passwords: https://support.google.com/accounts/answer/185833
3. Gemini API: https://ai.google.dev/tutorials/setup

---

## ⏱️ Time Estimate

- MongoDB password: 2 minutes
- Gmail app password: 3 minutes
- Gemini API key: 2 minutes
- Testing: 5 minutes

**Total**: ~12 minutes

---

**IMPORTANT**: Do not deploy to production until all credentials are rotated!
