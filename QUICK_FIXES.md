# Quick Fixes Before Deployment
## Critical Issues - Fix in Next 60 Minutes

### 1. Fix NPM Vulnerabilities (5 min)
```bash
cd backend
npm audit fix
# If some remain:
npm audit fix --force
# Note: cloudinary update may require code changes
```

### 2. Update .env.example with Missing Variables (5 min)

Add these to `backend/.env.example`:

```bash
# Add after existing EMAIL variables:
EMAIL_FROM=MyGF AI <noreply@yourdomaincom>
EMAIL_SECURE=false

# Add Twilio configuration (if using WhatsApp):
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Add for frontend app:
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-flash
```

### 3. Add Rate Limiting (10 min)

```bash
cd backend
npm install express-rate-limit
```

Create `backend/middleware/rateLimiter.js`:
```javascript
const rateLimit = require('express-rate-limit');

// Auth endpoints limiter
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// General API limiter
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
```

Update `backend/routes/auth.js`:
```javascript
const { authLimiter } = require('../middleware/rateLimiter');

// Apply to sensitive routes:
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify', authLimiter, verifyAccount);
```

### 4. Add Input Sanitization (10 min)

```bash
cd backend
npm install express-mongo-sanitize xss-clean
```

Update `backend/server.js` (add after line 35):
```javascript
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Add after existing middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
```

### 5. Fix Error Handler for Production (5 min)

Update `backend/middleware/errorHandler.js`:
```javascript
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console in development only
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    } else {
        // In production, log without stack trace
        console.error('Error:', err.message);
    }

    // ... rest of code stays the same
```

### 6. Fix CORS Configuration (5 min)

Update `backend/server.js` lines 25-32:
```javascript
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
```

Update `backend/services/websocketService.js` line 20:
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:3000',
```

### 7. Standardize Email Variables (10 min)

**Problem**: Code uses both `EMAIL_*` and `SMTP_*` variables.

**Solution**: Pick one (recommend `EMAIL_*`) and update:

Update `backend/services/emailService.js` lines 15-20:
```javascript
this.transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

Update lines 92, 149, 201 to use:
```javascript
from: `"MyGF AI" <${process.env.EMAIL_USER}>`,
```

### 8. Add Environment Validation (10 min)

Create `backend/config/validateEnv.js`:
```javascript
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'FRONTEND_URL'
];

const optionalEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'GOOGLE_CLIENT_ID',
    'GEMINI_API_KEY'
];

function validateEnv() {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => console.error(`   - ${varName}`));
        console.error('\nPlease check your .env file');
        process.exit(1);
    }

    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    if (missingOptional.length > 0) {
        console.warn('⚠️  Missing optional environment variables:');
        missingOptional.forEach(varName => console.warn(`   - ${varName}`));
    }

    console.log('✅ Environment variables validated');
}

module.exports = validateEnv;
```

Add to `backend/server.js` after line 13:
```javascript
const validateEnv = require('./config/validateEnv');
validateEnv();
```

## After Fixes - Test Everything

### 1. Test Backend
```bash
cd backend
npm test  # if you have tests
node test-email.js  # Test email
curl http://localhost:5000/api/health  # Test health endpoint
```

### 2. Test Rate Limiting
```bash
# Try logging in 6 times quickly - should get rate limited
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### 3. Commit All Changes
```bash
git add .
git commit -m "Add production security fixes and deployment preparation"
git push origin main
```

## Deployment Commands

### Render/Railway
1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Deploy automatically

### Manual Deploy
```bash
# On your server:
git clone <your-repo>
cd Genesis/backend
npm install --production
NODE_ENV=production npm start
```

## Post-Deployment Verification

```bash
# 1. Health check
curl https://your-backend.com/api/health

# 2. Test CORS
curl -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  https://your-backend.com/api/auth/login

# 3. Test rate limiting
# Make 6 requests quickly - should get 429 on 6th

# 4. Test authentication
curl -X POST https://your-backend.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!","phone":"1234567890"}'
```

## Monitoring Checklist

After deployment, monitor for 24-48 hours:
- [ ] Error logs (check for spikes)
- [ ] Response times (should be <500ms)
- [ ] Database connections (check MongoDB Atlas)
- [ ] Email delivery (check logs)
- [ ] WebSocket connections (check real-time features)
- [ ] Memory usage (should be stable)
- [ ] CPU usage (should be <70%)

## Emergency Rollback

If something goes wrong:
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or rollback in hosting platform dashboard
```

## Support Contacts

- MongoDB Atlas: https://cloud.mongodb.com/support
- Email Issues: Check Gmail app password and 2FA
- Twilio: https://support.twilio.com
- Cloudinary: https://support.cloudinary.com
