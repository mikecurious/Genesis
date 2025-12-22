# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the MyGF AI Real Estate Platform.

## Overview

The Google OAuth integration allows users to sign in with their Google account, providing:
- Quick and secure authentication
- Pre-verified email addresses
- Better user experience
- Access to personalized features

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Both frontend and backend running

## Step-by-Step Setup

### Part 1: Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Either create a new project or select an existing one
   - Project name suggestion: "MyGF AI Real Estate"

3. **Enable Required APIs**
   - In the left sidebar, go to **APIs & Services > Library**
   - Search for "Google Identity Services" or "Google+ API"
   - Click on it and press **Enable**

4. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client ID**

   If prompted to configure OAuth consent screen:
   - Click **Configure Consent Screen**
   - Choose **External** (unless you have a Google Workspace)
   - Fill in:
     - App name: "MyGF AI Real Estate"
     - User support email: your email
     - Developer contact: your email
   - Click **Save and Continue**
   - Skip "Scopes" (click Save and Continue)
   - Skip "Test users" (click Save and Continue)
   - Click **Back to Dashboard**

5. **Configure OAuth Client**
   - Back in Credentials, click **Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: "MyGF AI Web Client"

   **Authorized JavaScript origins:**
   ```
   http://localhost:3001
   http://localhost:3000
   ```
   For production, add:
   ```
   https://yourdomain.com
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3001
   http://localhost:3000
   ```
   For production, add:
   ```
   https://yourdomain.com
   ```

6. **Copy Client ID**
   - After creating, you'll see a popup with your Client ID and Client Secret
   - **Copy the Client ID** (you'll need this for both frontend and backend)
   - You can always find it later in the Credentials page

### Part 2: Backend Configuration

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Open or create `.env` file**
   ```bash
   # If .env doesn't exist, copy from example
   cp .env.example .env
   ```

3. **Add Google Client ID to backend/.env**
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   ```
   Replace `your_actual_client_id_here.apps.googleusercontent.com` with the Client ID you copied from Google Cloud Console.

4. **Verify backend dependencies**
   The `google-auth-library` package should already be installed. If not:
   ```bash
   npm install google-auth-library
   ```

5. **Restart backend server**
   ```bash
   npm run dev
   ```

### Part 3: Frontend Configuration

1. **Navigate to root directory**
   ```bash
   cd ..  # or cd /path/to/My_Genesis
   ```

2. **Open `.env` file in root directory**
   ```bash
   # The .env file is in the root, not in backend
   nano .env  # or use your preferred editor
   ```

3. **Add Google Client ID to .env**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   ```
   **IMPORTANT:** Use the SAME Client ID as in the backend .env

4. **Save and restart frontend**
   ```bash
   npm run dev
   ```

### Part 4: Testing the Integration

1. **Start both servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

2. **Open the application**
   - Go to http://localhost:3001
   - You should NOT see the orange warning about "Google OAuth not configured"

3. **Test Google Sign-In**
   - Look for the Google Sign-In button in the application
   - Click "Sign in with Google"
   - Select your Google account
   - Grant permissions
   - You should be redirected back and signed in

4. **Verify successful sign-in**
   - Check browser console for "Google Sign-In successful" message
   - Your user name and email should appear in the UI
   - Token should be stored in localStorage

## Troubleshooting

### Issue: "Google OAuth not configured" warning appears

**Solution:**
- Check that `VITE_GOOGLE_CLIENT_ID` is set in the root `.env` file
- Make sure the value is not "YOUR_GOOGLE_CLIENT_ID_HERE"
- Restart the frontend server after changing .env

### Issue: "Invalid Google token" error

**Solution:**
- Verify `GOOGLE_CLIENT_ID` is set in `backend/.env`
- Ensure frontend and backend use the SAME Client ID
- Check that the Client ID ends with `.apps.googleusercontent.com`
- Restart the backend server

### Issue: "redirect_uri_mismatch" error

**Solution:**
- Go back to Google Cloud Console > Credentials
- Edit your OAuth 2.0 Client
- Add the exact URL you're accessing (e.g., http://localhost:3001)
- Make sure there are no trailing slashes
- Wait a few minutes for changes to propagate

### Issue: "Access blocked: This app's request is invalid"

**Solution:**
- Go to Google Cloud Console > OAuth consent screen
- Make sure the app is published (or add yourself as a test user)
- Check that required scopes are configured

### Issue: User signed in but role is "Tenant" instead of expected role

**Explanation:**
- New Google sign-ins default to "Tenant" role
- This is by design for security
- Users can update their role in account settings
- Or you can manually update in database

**To change default role:**
- Edit `backend/controllers/googleAuth.js:53`
- Change `role: 'Tenant'` to your preferred default role

## Security Best Practices

1. **Never commit your .env files**
   - Make sure `.env` is in `.gitignore`
   - Use `.env.example` files for templates

2. **Use environment-specific URLs**
   - Development: http://localhost:3001
   - Production: https://yourdomain.com
   - Never mix development and production credentials

3. **Rotate credentials regularly**
   - Especially before deploying to production
   - Create separate OAuth clients for dev/staging/production

4. **Limit OAuth scopes**
   - Only request necessary permissions
   - Current implementation only uses email and profile

## Production Deployment

Before deploying to production:

1. **Create separate OAuth Client**
   - Don't reuse development credentials
   - Create a new OAuth 2.0 Client ID for production

2. **Update authorized URLs**
   - Add your production domain to Authorized JavaScript origins
   - Add your production domain to Authorized redirect URIs
   - Example: https://mygf-ai.com

3. **Update environment variables**
   - Production backend .env: `GOOGLE_CLIENT_ID=prod_client_id`
   - Production frontend .env: `VITE_GOOGLE_CLIENT_ID=prod_client_id`

4. **Configure OAuth Consent Screen**
   - Add privacy policy URL
   - Add terms of service URL
   - Add application logo
   - Submit for verification if needed

5. **Test thoroughly**
   - Test sign-in flow on production domain
   - Verify token validation
   - Check error handling

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

## Need Help?

If you encounter issues not covered in this guide:

1. Check browser console for error messages
2. Check backend server logs for errors
3. Verify all environment variables are set correctly
4. Ensure both servers are running
5. Clear browser cache and localStorage

## Summary Checklist

- [ ] Google Cloud project created
- [ ] Google Identity Services API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins configured
- [ ] Authorized redirect URIs configured
- [ ] Client ID copied
- [ ] Backend `.env` updated with `GOOGLE_CLIENT_ID`
- [ ] Frontend `.env` updated with `VITE_GOOGLE_CLIENT_ID`
- [ ] Both servers restarted
- [ ] No "OAuth not configured" warning visible
- [ ] Google Sign-In button appears
- [ ] Sign-in flow tested successfully
- [ ] User data persisted correctly

---

**Last Updated:** 2025-12-20
**Platform Version:** 1.0.0
