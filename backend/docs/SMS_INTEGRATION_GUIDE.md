# SMS Integration Guide

Complete guide for using Celcom Africa SMS integration in the Genesis application.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Services Overview](#services-overview)
3. [Usage Examples](#usage-examples)
4. [Testing Endpoints](#testing-endpoints)
5. [Common Use Cases](#common-use-cases)
6. [Best Practices](#best-practices)

---

## Environment Setup

### Required Environment Variables

Add these to your `.env` file:

```env
# Celcom Africa SMS Configuration
CELCOM_AFRICA_API_KEY=your_api_key_here
CELCOM_AFRICA_PARTNER_ID=your_partner_id_here
CELCOM_AFRICA_SHORTCODE=GENESIS
```

### Getting Credentials

1. Visit [https://celcomafrica.com/](https://celcomafrica.com/)
2. Click "GET API KEY & PARTNER ID" button
3. Copy your credentials from the dashboard
4. Paste them into your `.env` file

---

## Services Overview

### 1. `celcomAfricaService.js`
Low-level service for direct SMS operations.

**Methods:**
- `sendSMS({ to, message, shortcode, timeToSend })` - Send SMS
- `getBalance()` - Check SMS balance
- `getDeliveryReport({ messageId })` - Get delivery status
- `formatPhoneNumber(phone)` - Format phone to 254XXXXXXXXX
- `getHealthStatus()` - Check service status

### 2. `notificationService.js`
High-level service for common notification patterns.

**Methods:**
- `sendSystemAlert({ to, message, priority })` - System alerts
- `sendPaymentConfirmation({ to, amount, transactionId, paymentMethod })` - Payment notifications
- `sendSubscriptionUpdate({ to, plan, status, expiresAt })` - Subscription updates
- `sendSecurityAlert({ to, alertType, details })` - Security alerts
- `sendPropertyNotification({ to, propertyTitle, action, details })` - Property notifications
- `sendBookingConfirmation({ to, propertyTitle, checkIn, checkOut, bookingId })` - Booking confirmations
- `sendReminder({ to, reminderType, details })` - Reminders
- `sendCustomNotification({ to, message, channel })` - Custom messages
- `sendBulkNotification({ recipients, message, channel })` - Bulk notifications

### 3. `smsHelper.js` (Utility Functions)
Simple, reusable functions for common SMS patterns.

**Functions:**
- `sendOTP(phone, options)` - Send verification codes
- `sendTransactionOTP(phone, options)` - Send transaction verification
- `sendWelcomeSMS(phone, userName)` - Welcome new users
- `sendAlert(phone, alertMessage, priority)` - Quick alerts
- `sendPaymentNotification(phone, paymentData)` - Payment updates
- `sendBookingNotification(phone, bookingData)` - Booking updates
- `sendSecurityAlert(phone, alertType, details)` - Security alerts
- `sendReminder(phone, reminderText)` - Reminders
- `sendBulkSMS(phoneNumbers, message)` - Bulk messages
- `sendTemplatedMessage(phone, templateName, variables)` - Use templates
- `formatPhone(phone)` - Format phone number
- `isValidPhone(phone)` - Validate phone number
- `generateCode(length)` - Generate numeric codes
- `generateAlphanumericCode(length)` - Generate alphanumeric codes

---

## Usage Examples

### Example 1: Send OTP During Registration

```javascript
const smsHelper = require('../utils/smsHelper');

// In your auth controller
exports.register = async (req, res) => {
    const { name, email, phone } = req.body;

    // Create user...

    // Send OTP
    const result = await smsHelper.sendOTP(phone, {
        length: 6,
        expiryMinutes: 5,
        appName: 'Genesis'
    });

    if (result.success) {
        // Store OTP in database or memory
        const otp = result.otp;

        res.json({
            success: true,
            message: 'OTP sent to your phone'
        });
    }
};
```

### Example 2: Send Payment Confirmation

```javascript
const notificationService = require('../services/notificationService');

// In your payment controller
exports.confirmPayment = async (req, res) => {
    const { userId, amount, transactionId } = req.body;

    // Process payment...

    // Send confirmation
    await notificationService.sendPaymentConfirmation({
        to: user.phone,
        amount: amount,
        transactionId: transactionId,
        paymentMethod: 'M-Pesa'
    });

    res.json({ success: true });
};
```

### Example 3: Send Security Alert

```javascript
const smsHelper = require('../utils/smsHelper');

// In your auth middleware
exports.notifyLogin = async (user, req) => {
    const deviceInfo = `${req.headers['user-agent']?.substring(0, 50)}`;
    const location = req.ip;

    await smsHelper.sendSecurityAlert(
        user.phone,
        'login',
        `Device: ${deviceInfo}\nLocation: ${location}\nTime: ${new Date().toLocaleString()}`
    );
};
```

### Example 4: Send Bulk Notification

```javascript
const smsHelper = require('../utils/smsHelper');

// Send to multiple users
const phoneNumbers = ['0712345678', '0723456789', '0734567890'];
const message = 'System maintenance scheduled for tonight at 10 PM. Expected downtime: 30 minutes.';

const result = await smsHelper.sendBulkSMS(phoneNumbers, message);

console.log(`Sent to ${result.recipients?.length || 0} recipients`);
```

### Example 5: Use Message Templates

```javascript
const smsHelper = require('../utils/smsHelper');

// Send templated message
await smsHelper.sendTemplatedMessage(
    '0712345678',
    'booking_confirmed',
    {
        propertyTitle: 'Luxury Apartment in Westlands',
        checkIn: '2026-02-01',
        bookingId: 'BK123456'
    }
);

// Available templates:
// - otp
// - welcome
// - payment_success
// - booking_confirmed
// - subscription_active
// - security_alert
// - reminder
```

### Example 6: Transaction OTP

```javascript
const smsHelper = require('../utils/smsHelper');

// Send transaction OTP with amount
const result = await smsHelper.sendTransactionOTP(phone, {
    amount: 5000,
    transactionType: 'payment',
    expiryMinutes: 3
});

if (result.success) {
    // Store OTP for verification
    const otp = result.otp;
    console.log(`OTP sent: ${otp}`);
}
```

### Example 7: Phone Number Validation

```javascript
const smsHelper = require('../utils/smsHelper');

// Validate and format phone numbers
const phone = '0712345678';
const formatted = smsHelper.formatPhone(phone); // Returns: 254712345678
const isValid = smsHelper.isValidPhone(phone);   // Returns: true

if (isValid) {
    await smsHelper.sendQuickSMS(formatted, 'Your message here');
}
```

---

## Testing Endpoints

### Available Test Routes

All routes are under `/api/sms-notifications/`

#### 1. Test OTP
```bash
POST /api/sms-notifications/test-otp
Content-Type: application/json

{
  "phone": "0712345678"
}
```

#### 2. Test System Alert
```bash
POST /api/sms-notifications/test-alert
Content-Type: application/json

{
  "phone": "0712345678",
  "message": "Test alert message",
  "priority": "high"
}
```

#### 3. Test Payment Confirmation
```bash
POST /api/sms-notifications/test-payment
Content-Type: application/json

{
  "phone": "0712345678",
  "amount": "1000",
  "transactionId": "ABC123",
  "paymentMethod": "M-Pesa"
}
```

#### 4. Test Booking Confirmation
```bash
POST /api/sms-notifications/test-booking
Content-Type: application/json

{
  "phone": "0712345678",
  "propertyTitle": "Luxury Apartment",
  "checkIn": "2026-02-01",
  "checkOut": "2026-02-05"
}
```

#### 5. Test Security Alert
```bash
POST /api/sms-notifications/test-security
Content-Type: application/json

{
  "phone": "0712345678",
  "alertType": "login",
  "details": "New login from Chrome on Windows"
}
```
**Alert Types:** `login`, `password_changed`, `suspicious_activity`, `account_locked`

#### 6. Test Subscription Update
```bash
POST /api/sms-notifications/test-subscription
Content-Type: application/json

{
  "phone": "0712345678",
  "plan": "Premium",
  "status": "active"
}
```
**Status Options:** `active`, `expired`, `expiring_soon`

#### 7. Test Welcome Message
```bash
POST /api/sms-notifications/test-welcome
Content-Type: application/json

{
  "phone": "0712345678",
  "userName": "John Doe"
}
```

#### 8. Test Template Message
```bash
POST /api/sms-notifications/test-template
Content-Type: application/json

{
  "phone": "0712345678",
  "templateName": "payment_success",
  "variables": {
    "amount": "1000",
    "transactionId": "ABC123"
  }
}
```

#### 9. Test Bulk SMS
```bash
POST /api/sms-notifications/test-bulk
Content-Type: application/json

{
  "phones": ["0712345678", "0723456789"],
  "message": "Test bulk message"
}
```

#### 10. Check Service Health
```bash
GET /api/sms-notifications/health
```

#### 11. Get Available Templates
```bash
GET /api/sms-notifications/templates
```

#### 12. Validate Phone Number
```bash
GET /api/sms-notifications/validate-phone?phone=0712345678
```

---

## Common Use Cases

### 1. User Registration with SMS Verification

```javascript
const smsHelper = require('../utils/smsHelper');

// Send verification code
const result = await smsHelper.sendOTP(phone);
if (result.success) {
    // Store OTP in database with expiry
    await OTP.create({
        phone: phone,
        code: result.otp,
        expiresAt: new Date(Date.now() + 5 * 60000)
    });
}
```

### 2. Payment Notifications

```javascript
const notificationService = require('../services/notificationService');

// After successful payment
await notificationService.sendPaymentConfirmation({
    to: user.phone,
    amount: payment.amount,
    transactionId: payment.mpesaReceiptNumber,
    paymentMethod: 'M-Pesa'
});
```

### 3. Subscription Expiry Reminders

```javascript
const notificationService = require('../services/notificationService');

// Send reminder 3 days before expiry
await notificationService.sendSubscriptionUpdate({
    to: user.phone,
    plan: user.subscription.plan,
    status: 'expiring_soon',
    expiresAt: user.subscription.expiresAt
});
```

### 4. Property Booking Confirmations

```javascript
const notificationService = require('../services/notificationService');

// Send booking confirmation
await notificationService.sendBookingConfirmation({
    to: tenant.phone,
    propertyTitle: property.title,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    bookingId: booking._id
});

// Notify property owner
await notificationService.sendPropertyNotification({
    to: owner.phone,
    propertyTitle: property.title,
    action: 'booking',
    details: `New booking from ${tenant.name} for ${booking.duration} days`
});
```

### 5. Security Alerts

```javascript
const smsHelper = require('../utils/smsHelper');

// Password changed
await smsHelper.sendSecurityAlert(
    user.phone,
    'password_changed',
    'Your password was changed'
);

// Suspicious login
await smsHelper.sendSecurityAlert(
    user.phone,
    'suspicious_activity',
    'Login from unusual location'
);
```

### 6. Scheduled Reminders

```javascript
const smsHelper = require('../utils/smsHelper');

// Rent payment reminder
await smsHelper.sendReminder(
    tenant.phone,
    `Your rent of KES ${rent.amount} is due on ${rent.dueDate}. Pay now to avoid late fees.`
);

// Appointment reminder
await smsHelper.sendReminder(
    user.phone,
    `Property viewing scheduled for tomorrow at ${appointment.time}. Location: ${property.address}`
);
```

---

## Best Practices

### 1. Error Handling

Always check the result and handle errors gracefully:

```javascript
const result = await smsHelper.sendOTP(phone);

if (!result.success) {
    console.error('SMS failed:', result.error);
    // Fall back to email or show error to user
    return res.status(500).json({
        success: false,
        message: 'Could not send verification code. Please try again.'
    });
}
```

### 2. Phone Number Validation

Always validate phone numbers before sending:

```javascript
const smsHelper = require('../utils/smsHelper');

if (!smsHelper.isValidPhone(phone)) {
    return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
    });
}

const formatted = smsHelper.formatPhone(phone);
await smsHelper.sendQuickSMS(formatted, message);
```

### 3. Rate Limiting

Implement rate limiting for OTP sending:

```javascript
// Example: Limit to 3 OTP requests per phone per hour
const rateLimitKey = `otp_${phone}`;
const attempts = await redis.get(rateLimitKey);

if (attempts && attempts >= 3) {
    return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.'
    });
}

await smsHelper.sendOTP(phone);
await redis.incr(rateLimitKey);
await redis.expire(rateLimitKey, 3600);
```

### 4. Message Length

Keep messages concise. Celcom charges per SMS segment:
- 1 segment = 160 characters (GSM-7 encoding)
- 2 segments = 161-306 characters
- Consider costs when sending long messages

### 5. Logging

Always log SMS operations for debugging and auditing:

```javascript
const result = await smsHelper.sendOTP(phone);

if (result.success) {
    console.log(`✅ OTP sent to ${phone} at ${new Date().toISOString()}`);
} else {
    console.error(`❌ OTP failed for ${phone}: ${result.error}`);
}
```

### 6. Testing in Development

Use development mode to see OTP codes in response:

```javascript
// OTP is only returned in development mode
if (process.env.NODE_ENV === 'development') {
    console.log('Development OTP:', result.otp);
}
```

### 7. Bulk Sending

Use bulk SMS for efficiency when sending to multiple recipients:

```javascript
// More efficient than individual sends
const phoneNumbers = users.map(u => u.phone);
await smsHelper.sendBulkSMS(phoneNumbers, 'Your message here');
```

### 8. Delivery Reports

Check delivery status for critical messages:

```javascript
const result = await celcomAfricaService.sendSMS({ to: phone, message });

if (result.success && result.messageIds) {
    // Store message ID for later tracking
    await Message.create({
        phone: phone,
        messageId: result.messageIds[0],
        sentAt: new Date()
    });

    // Later, check delivery status
    const dlr = await celcomAfricaService.getDeliveryReport({
        messageId: messageId
    });
}
```

---

## Troubleshooting

### Issue: SMS not sending

1. Check credentials in `.env` file
2. Check balance: `GET /api/celcomafrica/balance`
3. Check service health: `GET /api/sms-notifications/health`
4. Verify phone number format: `GET /api/sms-notifications/validate-phone?phone=0712345678`

### Issue: Invalid phone number

- Phone must be Kenyan format (254XXXXXXXXX)
- Use `formatPhone()` to convert
- Use `isValidPhone()` to validate

### Issue: Messages not delivered

- Check delivery report using message ID
- Verify recipient's phone is active
- Check for network issues

---

## Support

For Celcom Africa API support:
- Website: [https://celcomafrica.com](https://celcomafrica.com)
- Documentation: [https://celcomafrica.com/developers-center](https://celcomafrica.com/developers-center)
- Support: Contact their support team via dashboard

For Genesis integration issues:
- Check logs in backend console
- Use health endpoints to diagnose
- Test with provided test endpoints
