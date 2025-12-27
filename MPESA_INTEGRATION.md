# M-Pesa Payment Integration Guide

## Overview

This project now includes full M-Pesa payment integration using Safaricom's Daraja API. Users can make payments using M-Pesa STK Push (Lipa Na M-Pesa Online), which sends a payment prompt directly to their mobile phone.

## Features Implemented

### Backend Features
✅ M-Pesa STK Push (Lipa Na M-Pesa Online)
✅ OAuth authentication with Safaricom API
✅ Payment callback handling
✅ Payment status querying
✅ Payment history tracking
✅ Subscription payments
✅ Generic payments (property, services, etc.)
✅ Transaction logging and status updates

### Frontend Features
✅ M-Pesa payment modal with real-time status updates
✅ Phone number validation and formatting
✅ Payment polling and status tracking
✅ Success/failure notifications
✅ Payment history view

## Setup Instructions

### 1. Get M-Pesa API Credentials

#### For Sandbox (Testing):
1. Go to https://developer.safaricom.co.ke/
2. Create an account or log in
3. Navigate to "My Apps"
4. Create a new app and select "Lipa Na M-Pesa Online" product
5. Get your credentials from https://developer.safaricom.co.ke/test_credentials

**Sandbox Test Credentials:**
- Business Short Code: `174379`
- Passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- Test Phone Numbers: Any Kenyan number (254...)

#### For Production:
1. Apply for M-Pesa Go Live approval on the Daraja portal
2. Get production credentials from your approved app
3. Update environment variables to use production endpoints

### 2. Configure Environment Variables

Add the following to your `.env` file in the backend directory:

```env
# M-Pesa Configuration
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-callback
```

**Important Notes:**
- Replace `your_consumer_key_here` and `your_consumer_secret_here` with actual credentials
- Update `MPESA_CALLBACK_URL` with your actual deployed backend URL
- For local testing, use a tunneling service like ngrok to expose your local server

### 3. Set Up Callback URL (For Local Development)

Since M-Pesa needs to send callbacks to your server, you need to expose your local server:

**Using ngrok:**
```bash
# Install ngrok
npm install -g ngrok

# Start your backend server
cd backend
npm start

# In another terminal, start ngrok
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update MPESA_CALLBACK_URL in .env:
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/payments/mpesa-callback
```

## API Endpoints

### Payment Endpoints

#### 1. Initiate Subscription Payment
```http
POST /api/payments/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan": "MyGF 1.3",
  "phoneNumber": "254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated. Please check your phone to complete the transaction.",
  "checkoutRequestID": "ws_CO_XXXXXXXXX",
  "paymentId": "64abc123..."
}
```

#### 2. Initiate Generic Payment
```http
POST /api/payments/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "paymentType": "property",
  "description": "Property listing fee",
  "metadata": {
    "propertyId": "123"
  }
}
```

#### 3. Query Payment Status
```http
GET /api/payments/{paymentId}/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "status": "completed",
    "amount": 1000,
    "mpesaReceiptNumber": "QAH7K8M9XY",
    "phoneNumber": "254712345678",
    ...
  }
}
```

#### 4. Get Payment History
```http
GET /api/payments/history
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64abc123...",
      "amount": 1000,
      "status": "completed",
      "mpesaReceiptNumber": "QAH7K8M9XY",
      "createdAt": "2024-12-27T...",
      ...
    },
    ...
  ]
}
```

#### 5. M-Pesa Callback (Internal - Called by Safaricom)
```http
POST /api/payments/mpesa-callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "...",
      "CheckoutRequestID": "...",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      ...
    }
  }
}
```

## Frontend Usage

### Using the M-Pesa Payment Modal

```tsx
import { MpesaPaymentModal } from './components/modals/MpesaPaymentModal';
import { useState } from 'react';

function MyComponent() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowPaymentModal(true)}>
        Pay with M-Pesa
      </button>

      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={2500}
        description="MyGF 1.3 Subscription"
        paymentType="subscription"
        plan="MyGF 1.3"
        onSuccess={(payment) => {
          console.log('Payment successful!', payment);
          // Update user subscription status
        }}
        onFailed={(payment) => {
          console.log('Payment failed', payment);
        }}
      />
    </>
  );
}
```

### Using the Payment Service Directly

```tsx
import { paymentService } from './services/paymentService';

// Initiate payment
const response = await paymentService.initiatePayment({
  phoneNumber: '254712345678',
  amount: 1000,
  paymentType: 'property',
  description: 'Property listing fee'
});

// Query payment status
const statusResponse = await paymentService.queryPaymentStatus(paymentId);

// Get payment history
const historyResponse = await paymentService.getPaymentHistory();
```

## Payment Flow

### 1. User Initiates Payment
- User clicks "Pay with M-Pesa" button
- Payment modal opens
- User enters phone number
- System validates and formats phone number

### 2. STK Push Sent
- Frontend calls `/api/payments/initiate` or `/api/payments/pay`
- Backend creates payment record (status: `pending`)
- Backend calls M-Pesa API to initiate STK push
- Payment record updated to `processing`
- User receives prompt on their phone

### 3. User Confirms Payment
- User enters M-Pesa PIN on their phone
- M-Pesa processes the payment
- Frontend polls payment status every 2 seconds

### 4. Callback Received
- M-Pesa sends callback to `/api/payments/mpesa-callback`
- Backend updates payment record with result
- If successful: status = `completed`, M-Pesa receipt saved
- If failed: status = `failed`, error message saved

### 5. Frontend Updates
- Polling detects status change
- Success screen shown with receipt number
- Or failure screen shown with error message
- User can close modal or try again

## Payment States

- `pending`: Payment record created, STK push not sent yet
- `processing`: STK push sent, waiting for user confirmation
- `completed`: Payment successful, receipt received
- `failed`: Payment failed (user cancelled, insufficient funds, timeout, etc.)
- `cancelled`: User manually cancelled

## Testing

### Testing with Sandbox

1. Use any Kenyan phone number (254...)
2. No actual money is debited
3. You'll receive a real STK push on your phone
4. Enter any PIN (sandbox accepts any PIN)

### Testing Scenarios

**Successful Payment:**
```bash
# Use your actual phone number
254712345678
# Any PIN works in sandbox
```

**Failed Payment (User Cancels):**
- Start payment
- Decline the STK push on your phone

**Failed Payment (Timeout):**
- Start payment
- Don't respond to STK push
- Payment times out after 60 seconds

## Database Schema

### Payment Model
```javascript
{
  user: ObjectId,              // Reference to User
  phoneNumber: String,         // 254XXXXXXXXX format
  amount: Number,              // Amount in KES
  plan: String,                // Optional: subscription plan
  merchantRequestID: String,   // M-Pesa merchant request ID
  checkoutRequestID: String,   // M-Pesa checkout request ID
  mpesaReceiptNumber: String,  // M-Pesa receipt (e.g., QAH7K8M9XY)
  transactionDate: Date,       // When payment was completed
  status: String,              // pending|processing|completed|failed|cancelled
  resultCode: String,          // M-Pesa result code
  resultDesc: String,          // M-Pesa result description
  paymentType: String,         // subscription|property|service|tenant_payment|other
  paymentMethod: String,       // mpesa|card|bank
  metadata: Object,            // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Common M-Pesa Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 0 | Success | Payment completed successfully |
| 1 | Insufficient Balance | User needs to top up M-Pesa |
| 1032 | Cancelled by user | User declined the request |
| 1037 | Timeout | User didn't respond in time |
| 2001 | Invalid Parameters | Check phone number format |

### Frontend Error Handling

The payment modal handles all errors gracefully:
- Invalid phone numbers are caught before API call
- Network errors show user-friendly messages
- Timeout scenarios are handled automatically
- Users can retry failed payments

## Security Considerations

1. **Never expose credentials**: Consumer Key and Secret are server-side only
2. **Validate callbacks**: Ensure callbacks are from Safaricom's IP ranges
3. **Use HTTPS**: M-Pesa requires HTTPS for callbacks
4. **Validate amounts**: Always validate payment amounts match expected values
5. **Log transactions**: Keep detailed logs for auditing
6. **User authentication**: All payment endpoints require user authentication

## Production Checklist

- [ ] Get production M-Pesa credentials
- [ ] Update `MPESA_ENVIRONMENT=production` in .env
- [ ] Update callback URL to production domain (HTTPS required)
- [ ] Set up proper error monitoring
- [ ] Configure payment reconciliation process
- [ ] Set up alerts for failed payments
- [ ] Test with real money (small amounts first)
- [ ] Implement refund process if needed
- [ ] Set up payment reporting/analytics

## Troubleshooting

### Issue: STK push not received
**Solutions:**
- Verify phone number format (254XXXXXXXXX)
- Check if phone is M-Pesa registered
- Ensure phone has network connectivity
- Try different phone number

### Issue: Callback not received
**Solutions:**
- Verify callback URL is accessible (use ngrok for local dev)
- Check Safaricom's IP whitelist settings
- Ensure HTTPS is used for production
- Check server logs for incoming requests

### Issue: Payment stuck in processing
**Solutions:**
- User might not have completed payment on phone
- Check M-Pesa system status
- Query payment status via API
- Implement automatic status queries after timeout

## Support

For M-Pesa API issues:
- Safaricom Developer Portal: https://developer.safaricom.co.ke/
- Daraja Support: DarajaAPI@safaricom.co.ke
- API Documentation: https://developer.safaricom.co.ke/APIs

For Genesis App issues:
- Check application logs
- Review payment records in database
- Test with sandbox credentials first

## Additional Resources

- [M-Pesa API Documentation](https://developer.safaricom.co.ke/Documentation)
- [Daraja API Simulator](https://developer.safaricom.co.ke/test_credentials)
- [M-Pesa API Postman Collection](https://developer.safaricom.co.ke/downloads)

---

**Note**: This integration uses M-Pesa Express (STK Push). Other M-Pesa APIs like C2B, B2B, and B2C can be added using similar patterns in the `mpesaService.js` file.
