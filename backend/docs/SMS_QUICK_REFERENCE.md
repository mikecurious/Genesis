# SMS Integration Quick Reference

## Quick Imports

```javascript
// Main services
const celcomAfricaService = require('./services/celcomAfricaService');
const notificationService = require('./services/notificationService');
const smsHelper = require('./utils/smsHelper');
```

---

## Most Common Operations

### Send OTP (Recommended)
```javascript
const result = await smsHelper.sendOTP(phone, {
    length: 6,
    expiryMinutes: 5
});
// Returns: { success: true, otp: "123456", ... }
```

### Send Simple SMS
```javascript
await smsHelper.sendQuickSMS(phone, 'Your message here');
```

### Send Payment Confirmation
```javascript
await notificationService.sendPaymentConfirmation({
    to: phone,
    amount: 1000,
    transactionId: 'ABC123',
    paymentMethod: 'M-Pesa'
});
```

### Send Security Alert
```javascript
await smsHelper.sendSecurityAlert(phone, 'login', 'New login detected');
```

### Validate Phone Number
```javascript
const isValid = smsHelper.isValidPhone(phone);
const formatted = smsHelper.formatPhone(phone);
```

---

## Environment Variables

```env
CELCOM_AFRICA_API_KEY=your_api_key_here
CELCOM_AFRICA_PARTNER_ID=your_partner_id_here
CELCOM_AFRICA_SHORTCODE=GENESIS
```

---

## Test Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sms-notifications/test-otp` | POST | Test OTP sending |
| `/api/sms-notifications/test-alert` | POST | Test system alerts |
| `/api/sms-notifications/test-payment` | POST | Test payment notification |
| `/api/sms-notifications/test-booking` | POST | Test booking confirmation |
| `/api/sms-notifications/test-security` | POST | Test security alert |
| `/api/sms-notifications/health` | GET | Check service status |
| `/api/celcomafrica/balance` | GET | Check SMS balance |

---

## SMS Helper Functions Cheat Sheet

| Function | Purpose | Example |
|----------|---------|---------|
| `sendOTP(phone, options)` | Send verification code | `sendOTP('0712345678')` |
| `sendTransactionOTP(phone, options)` | Transaction verification | `sendTransactionOTP(phone, { amount: 1000 })` |
| `sendWelcomeSMS(phone, name)` | Welcome message | `sendWelcomeSMS(phone, 'John')` |
| `sendAlert(phone, message, priority)` | Quick alert | `sendAlert(phone, 'Server down', 'high')` |
| `sendReminder(phone, text)` | Reminder | `sendReminder(phone, 'Rent due tomorrow')` |
| `sendBulkSMS(phones, message)` | Bulk message | `sendBulkSMS([...], 'Hello')` |
| `formatPhone(phone)` | Format phone | `formatPhone('0712345678')` → `'254712345678'` |
| `isValidPhone(phone)` | Validate phone | `isValidPhone('0712345678')` → `true` |
| `generateCode(length)` | Generate numeric code | `generateCode(6)` → `'123456'` |

---

## Notification Service Functions

| Function | Purpose |
|----------|---------|
| `sendSystemAlert({ to, message, priority })` | System alerts |
| `sendPaymentConfirmation({ to, amount, transactionId, paymentMethod })` | Payment notifications |
| `sendSubscriptionUpdate({ to, plan, status, expiresAt })` | Subscription updates |
| `sendSecurityAlert({ to, alertType, details })` | Security alerts |
| `sendBookingConfirmation({ to, propertyTitle, checkIn, checkOut, bookingId })` | Booking confirmations |
| `sendPropertyNotification({ to, propertyTitle, action, details })` | Property notifications |
| `sendReminder({ to, reminderType, details })` | Reminders |
| `sendBulkNotification({ recipients, message, channel })` | Bulk notifications |

---

## Common Patterns

### Registration with OTP
```javascript
const { otp, success } = await smsHelper.sendOTP(phone);
if (success) {
    await OTP.create({ phone, code: otp, expiresAt: Date.now() + 300000 });
}
```

### Payment Flow
```javascript
// Send transaction OTP
const { otp } = await smsHelper.sendTransactionOTP(phone, { amount: 1000 });

// After payment confirmation
await notificationService.sendPaymentConfirmation({
    to: phone,
    amount: 1000,
    transactionId: 'TXN123',
    paymentMethod: 'M-Pesa'
});
```

### Security Monitoring
```javascript
// On login
await smsHelper.sendSecurityAlert(phone, 'login', `New login from ${device}`);

// On password change
await smsHelper.sendSecurityAlert(phone, 'password_changed', 'Password updated');
```

### Bulk Notifications
```javascript
const phones = users.map(u => u.phone);
await smsHelper.sendBulkSMS(phones, 'System maintenance tonight at 10 PM');
```

---

## Error Handling Pattern

```javascript
const result = await smsHelper.sendOTP(phone);

if (!result.success) {
    console.error('SMS Error:', result.error);
    // Fallback or show error
    return res.status(500).json({
        success: false,
        message: 'Failed to send verification code'
    });
}

// Success - proceed
console.log('OTP sent:', result.otp);
```

---

## Phone Number Formats

| Input | Formatted Output |
|-------|------------------|
| `0712345678` | `254712345678` |
| `+254712345678` | `254712345678` |
| `254712345678` | `254712345678` |
| `712345678` | `254712345678` |

---

## Message Templates

Available templates:
- `otp` - OTP verification
- `welcome` - Welcome message
- `payment_success` - Payment confirmation
- `booking_confirmed` - Booking confirmation
- `subscription_active` - Subscription activation
- `security_alert` - Security alert
- `reminder` - Reminder

### Usage:
```javascript
await smsHelper.sendTemplatedMessage(phone, 'payment_success', {
    amount: '1000',
    transactionId: 'ABC123'
});
```

---

## Testing Checklist

- [ ] Add credentials to `.env`
- [ ] Test OTP: `POST /api/sms-notifications/test-otp`
- [ ] Check balance: `GET /api/celcomafrica/balance`
- [ ] Verify phone format: `GET /api/sms-notifications/validate-phone?phone=0712345678`
- [ ] Check health: `GET /api/sms-notifications/health`
- [ ] Test payment notification
- [ ] Test security alert
- [ ] Test bulk SMS

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SMS not sending | Check credentials in `.env`, verify balance |
| Invalid phone | Use `formatPhone()` and `isValidPhone()` |
| OTP not received | Check delivery report, verify phone number |
| Service unavailable | Check `/health` endpoint |

---

## Cost Optimization Tips

1. Keep messages under 160 characters (1 SMS)
2. Use bulk SMS for multiple recipients
3. Implement rate limiting for OTPs
4. Cache frequently sent messages
5. Use templates to avoid typos
6. Monitor balance regularly

---

## Important Notes

- ✅ OTP is automatically sent via SMS during registration
- ✅ Phone numbers are auto-formatted to Kenyan format (254...)
- ✅ Service checks credentials on startup
- ✅ All services handle errors gracefully
- ✅ Development mode returns OTP in response
- ✅ Bulk SMS uses comma-separated numbers (efficient)

---

## Get Started in 3 Steps

1. **Add credentials to `.env`**
   ```env
   CELCOM_AFRICA_API_KEY=your_key
   CELCOM_AFRICA_PARTNER_ID=your_id
   ```

2. **Test the service**
   ```bash
   curl -X POST http://localhost:5000/api/sms-notifications/test-otp \
   -H "Content-Type: application/json" \
   -d '{"phone": "0712345678"}'
   ```

3. **Use in your code**
   ```javascript
   const smsHelper = require('./utils/smsHelper');
   await smsHelper.sendOTP(phone);
   ```

---

For detailed documentation, see [SMS_INTEGRATION_GUIDE.md](./SMS_INTEGRATION_GUIDE.md)
