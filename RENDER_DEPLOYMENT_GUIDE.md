# Render Deployment Guide for MyGF AI Backend

This guide will walk you through deploying your backend to Render.com (free tier).

## Step 1: Prepare Your Repository

✅ **DONE** - Your repository is ready with:
- Updated `render.yaml` configuration
- Backend configured in `backend/` directory
- All necessary dependencies in `backend/package.json`

## Step 2: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up using your **GitHub account** (recommended)
4. Authorize Render to access your repositories

## Step 3: Create New Web Service

1. From your Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **DidierNiy/MyGF-AI**
3. Render will detect the `render.yaml` file automatically
4. Click **"Apply"** to use the configuration

## Step 4: Configure Environment Variables

Render will create the service based on `render.yaml`, but you need to set the secret values.

Go to your service's **Environment** tab and set these values:

### Required Environment Variables:

```bash
# Database (CRITICAL - Get from backend/.env)
MONGO_URI=mongodb+srv://Genesis:My_Genesis@genesis.lq4ltrm.mongodb.net/mygf-ai?appName=Genesis

# JWT Secret (CRITICAL - Get from backend/.env)
JWT_SECRET=N74xxKQRLIp82oJKbO23b91w8JrgziCkAwZGj8HSiFNh

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (Optional - for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth (Optional - if you want to re-enable it later)
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### How to Add Each Variable:

1. In the **Environment** tab, click **"Add Environment Variable"**
2. Enter the **Key** (e.g., `MONGO_URI`)
3. Enter the **Value** (copy from your `backend/.env` file)
4. Click **"Save Changes"**

**Note:** The following are already set in `render.yaml` and don't need to be added manually:
- `NODE_ENV=production`
- `PORT=5000`
- `JWT_EXPIRE=30d`
- `FRONTEND_URL=https://mygf-ai-91159550-3d0b3.web.app`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`

## Step 5: Deploy

1. After setting all environment variables, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the build logs - deployment takes ~5 minutes
3. Once deployed, you'll get a URL like: `https://mygf-ai-backend.onrender.com`

## Step 6: Verify Deployment

Test your backend is working:

```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Backend server is running!",
  "timestamp": "2025-12-20T...",
  "database": "Connected to MongoDB Atlas"
}
```

## Step 7: Update Frontend Configuration

1. Copy your Render backend URL (e.g., `https://mygf-ai-backend.onrender.com`)

2. Update your frontend `.env` file:
   ```bash
   VITE_API_URL=https://mygf-ai-backend.onrender.com
   ```

3. Rebuild and redeploy frontend to Firebase:
   ```bash
   npm run build
   firebase deploy
   ```

## Step 8: Update CORS in Backend

Your backend needs to allow requests from Firebase. The `render.yaml` already sets:
```
FRONTEND_URL=https://mygf-ai-91159550-3d0b3.web.app
```

This is used in `backend/server.js` CORS configuration.

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `backend/package.json` has all dependencies
- Ensure Node.js version compatibility

### Database Connection Fails
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### API Calls Fail (CORS errors)
- Verify `FRONTEND_URL` matches your Firebase URL exactly
- Check browser console for specific CORS errors
- Ensure backend is deployed and healthy

## Free Tier Limitations

Render's free tier:
- ✅ Free forever
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold starts take ~30 seconds

**Note:** First request after inactivity will be slow. Subsequent requests are fast.

## Next Steps After Deployment

Once your backend URL is live:

1. ✅ Update frontend `.env` with backend URL
2. ✅ Rebuild and deploy frontend to Firebase
3. ✅ Test property search on https://mygf-ai-91159550-3d0b3.web.app/
4. ✅ Monitor logs in Render dashboard

---

**Need Help?** Check Render's documentation: https://render.com/docs
