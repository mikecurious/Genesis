# 🚨 CRITICAL: Security Action Required

## Overview
During deployment troubleshooting, exposed credentials were found in git history. These credentials have been removed from current files, but **they exist in git history** and must be rotated immediately.

---

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. Rotate MongoDB Credentials 🔴 CRITICAL

**Why**: MongoDB credentials were exposed in git commit history
**Risk**: Unauthorized database access, data breach

**Steps**:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access** (left sidebar)
3. Find your database user
4. Click **Edit** → **Edit Password**
5. Generate a strong password:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
6. Save the new password
7. Update your `backend/.env` file:
   ```
   MONGO_URI=mongodb+srv://<username>:<NEW_PASSWORD>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
   **Important**: URL-encode special characters in password:
   - `@` → `%40`
   - `$` → `%24`
   - `%` → `%25`
   - `!` → `%21`

8. **Update Render environment variable**:
   - Go to your backend service in Render
   - Navigate to **Environment** tab
   - Update `MONGO_URI` with the new connection string
   - Click **Save**
   - Manually trigger a redeploy

---

### 2. Rotate JWT Secret 🔴 CRITICAL

**Why**: JWT secret was exposed in git commit history
**Risk**: Session hijacking, authentication bypass

**Steps**:
1. Generate a new JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. Update `backend/.env`:
   ```
   JWT_SECRET=<new-generated-secret>
   ```
3. **Update Render environment variable**:
   - Go to your backend service in Render
   - Navigate to **Environment** tab
   - Update `JWT_SECRET`
   - Click **Save**
   - Manually trigger a redeploy

**Note**: This will invalidate all existing user sessions. Users will need to log in again.

---

### 3. Rotate Gmail App Password (if used) 🟡 RECOMMENDED

**Why**: Email credentials were exposed in git commit history
**Risk**: Email account compromise, spam, phishing

**Steps**:
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. **Revoke** the current app password for this application
3. Click **Create** → Select app and device
4. Copy the new 16-character password
5. Update `backend/.env`:
   ```
   EMAIL_PASS=<new-app-password>
   ```
6. Update Render if using email features

---

### 4. Rotate Gemini API Key (if used) 🟡 RECOMMENDED

**Why**: API key was exposed in git commit history
**Risk**: API quota abuse, unexpected costs

**Steps**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Find and **DELETE** the exposed key
3. Click **Create API Key**
4. Select your Google Cloud project
5. Copy the new key
6. Update `backend/.env`:
   ```
   GEMINI_API_KEY=<new-api-key>
   ```
7. Update Render if using AI features

---

## ✅ Verification Checklist

After rotating all credentials:

- [ ] MongoDB password changed in Atlas
- [ ] New MONGO_URI updated in `backend/.env`
- [ ] New MONGO_URI updated in Render environment variables
- [ ] JWT_SECRET regenerated and updated everywhere
- [ ] Gmail app password rotated (if applicable)
- [ ] Gemini API key rotated (if applicable)
- [ ] Backend redeployed to Render
- [ ] Test local connection:
  ```bash
  cd backend
  node -e "require('dotenv').config(); require('./config/db')();"
  ```
- [ ] Test production health endpoint:
  ```bash
  curl https://your-backend-url.onrender.com/api/health
  ```
- [ ] Verify database connection in production logs

---

## 🔒 Preventing Future Exposure

### Already Implemented:
✅ `.env` files are in `.gitignore`
✅ `.env.example` files use placeholders
✅ Documentation files sanitized

### Best Practices:
1. **Never commit `.env` files** - they're in `.gitignore` for a reason
2. **Use environment variables** for all secrets in production
3. **Rotate credentials regularly** - every 90 days minimum
4. **Use git hooks** to prevent accidental commits:
   ```bash
   # In .git/hooks/pre-commit (make executable)
   if git diff --cached --name-only | grep -q "\.env$"; then
     echo "Error: Attempting to commit .env file!"
     exit 1
   fi
   ```
5. **Scan repositories** for secrets before pushing:
   ```bash
   git diff --cached | grep -iE "(password|secret|api_key|token)" && echo "Warning: Possible secret detected"
   ```

---

## 📋 Current Status

| Credential | Status | Action |
|------------|--------|--------|
| `.env` files | ✅ Protected | In `.gitignore`, never committed |
| MongoDB URI | 🔴 ROTATE NOW | Was in documentation, now removed |
| JWT Secret | 🔴 ROTATE NOW | Was in documentation, now removed |
| Gmail App Password | 🟡 ROTATE | Was in security docs, now removed |
| Gemini API Key | 🟡 ROTATE | Was in security docs, now removed |

---

## ⏱️ Time Estimate

- MongoDB rotation: 3 minutes
- JWT secret rotation: 2 minutes
- Gmail rotation: 3 minutes
- Gemini rotation: 2 minutes
- Testing & verification: 5 minutes

**Total**: ~15 minutes

---

## 🆘 Need Help?

- MongoDB: https://www.mongodb.com/docs/atlas/security-add-mongodb-users/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Gemini API: https://ai.google.dev/tutorials/setup
- Render Environment Variables: https://render.com/docs/configure-environment-variables

---

**CRITICAL**: Do not deploy or use the application in production until MongoDB and JWT credentials are rotated!
