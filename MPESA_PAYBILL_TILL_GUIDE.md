# M-Pesa Paybill & Till Number Integration Guide

## 🎉 Features Added

Your Genesis Real Estate Platform now supports **BOTH** M-Pesa payment methods:

1. **✅ Paybill (CustomerPayBillOnline)** - For subscriptions, bills, recurring payments
2. **✅ Till Number (CustomerBuyGoodsOnline)** - For retail, property bookings, one-time payments

Users can now **choose** their preferred payment method when making payments!

---

## 📋 What Was Implemented

### Backend Changes

#### 1. M-Pesa Service (`backend/services/mpesaService.js`)
- ✅ Added support for both Paybill and Till Number
- ✅ Flexible configuration (can use one or both)
- ✅ Automatic transaction type selection
- ✅ Backward compatible with existing configuration
- ✅ New method: `getAvailablePaymentMethods()`

```javascript
// Example configuration
{
  hasPaybill: true,  // Paybill is configured
  hasTill: false,    // Till not configured (optional)
}

// Transaction types
Paybill: 'CustomerPayBillOnline'
Till:    'CustomerBuyGoodsOnline'
```

#### 2. Payment Model (`backend/models/Payment.js`)
- ✅ Added `mpesaMode` field (enum: 'paybill' | 'till')
- ✅ Stores which payment method was used
- ✅ Default: 'paybill' for backward compatibility

#### 3. Payment Controllers (`backend/controllers/payments.js`)
- ✅ Updated `initiatePayment()` - accepts `mpesaMode` parameter
- ✅ Updated `initiateGenericPayment()` - accepts `mpesaMode` parameter
- ✅ Updated `queryPaymentStatus()` - uses stored `mpesaMode`
- ✅ New endpoint: `GET /api/payments/methods` - returns available payment methods

#### 4. Routes (`backend/routes/payments.js`)
- ✅ Added `GET /api/payments/methods` endpoint (public)
- ✅ Returns configured payment methods for frontend

### Frontend Changes

#### 1. Payment Service (`frontend/services/paymentService.ts`)
- ✅ Added `PaymentMethod` interface
- ✅ Added `getPaymentMethods()` function
- ✅ Updated request interfaces to include `mpesaMode`

#### 2. M-Pesa Payment Modal (`frontend/components/modals/MpesaPaymentModal.tsx`)
- ✅ Fetches available payment methods on open
- ✅ Displays payment method selector (radio buttons)
- ✅ Shows method details (name, description, shortcode/till number)
- ✅ Passes selected method to backend
- ✅ Beautiful UI with green highlighting for selected method

### Configuration

#### Environment Variables (`.env`)

```env
# Basic M-Pesa Configuration (Required)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-callback

# Paybill Configuration (for subscriptions, bills)
MPESA_PAYBILL_SHORTCODE=174379
MPESA_PAYBILL_PASSKEY=your_paybill_passkey

# Till Number Configuration (for retail, one-time payments)
MPESA_TILL_NUMBER=your_till_number
MPESA_TILL_PASSKEY=your_till_passkey
```

**Note**: You can configure just Paybill, just Till, or both!

---

## 🚀 How It Works

### User Flow

1. **User clicks "Pay" button**
2. **M-Pesa modal opens**
3. **System fetches available payment methods** (`GET /api/payments/methods`)
4. **User sees payment options**:
   - 📋 **Paybill** - "Best for subscriptions and bills"
   - 🛒 **Till Number** - "Best for retail purchases"
5. **User selects preferred method** (radio button)
6. **User enters phone number**
7. **User submits payment**
8. **Backend initiates STK Push** with selected method
9. **User completes payment on phone**

### API Flow

```
GET /api/payments/methods
Response:
{
  "success": true,
  "data": [
    {
      "type": "paybill",
      "name": "Paybill",
      "shortCode": "174379",
      "description": "Best for subscriptions and bills"
    },
    {
      "type": "till",
      "name": "Till Number (Buy Goods)",
      "tillNumber": "123456",
      "description": "Best for retail purchases"
    }
  ]
}

POST /api/payments/initiate
{
  "plan": "Basic",
  "phoneNumber": "254712345678",
  "mpesaMode": "paybill"  // or "till"
}

POST /api/payments/pay
{
  "phoneNumber": "254712345678",
  "amount": 5000,
  "paymentType": "property",
  "description": "Property Booking",
  "mpesaMode": "till"  // or "paybill"
}
```

---

## 🧪 Testing Guide

### Test the Implementation

1. **Check M-Pesa Configuration**
```bash
node backend/scripts/testMpesaPayment.js
```

2. **Test Available Payment Methods**
```bash
curl https://genesis-hezn.onrender.com/api/payments/methods | jq
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "type": "paybill",
      "name": "Paybill",
      "shortCode": "174379",
      "description": "Best for subscriptions and bills"
    }
  ]
}
```

3. **Test Paybill Payment**
```bash
curl -X POST https://genesis-hezn.onrender.com/api/payments/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254708374149",
    "amount": 10,
    "paymentType": "other",
    "description": "Test Paybill Payment",
    "mpesaMode": "paybill"
  }'
```

4. **Test Till Payment** (when configured)
```bash
curl -X POST https://genesis-hezn.onrender.com/api/payments/pay \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254708374149",
    "amount": 10,
    "paymentType": "other",
    "description": "Test Till Payment",
    "mpesaMode": "till"
  }'
```

---

## 📊 Comparison: Paybill vs Till

| Feature | Paybill | Till Number |
|---------|---------|-------------|
| **Best For** | Subscriptions, Bills, Recurring | Retail, One-time, Bookings |
| **Transaction Type** | CustomerPayBillOnline | CustomerBuyGoodsOnline |
| **Use Case** | Monthly subscriptions | Property deposits |
| **Account Reference** | Supported | Supported |
| **Customer Experience** | "Pay Bill" option | "Buy Goods" option |
| **Configuration** | Shortcode + Passkey | Till Number + Passkey |

---

## 🔧 Configuration Options

### Option 1: Paybill Only (Default)
```env
MPESA_PAYBILL_SHORTCODE=174379
MPESA_PAYBILL_PASSKEY=your_passkey
```
- Users will only see Paybill option
- Best for subscription-based businesses

### Option 2: Till Only
```env
MPESA_TILL_NUMBER=123456
MPESA_TILL_PASSKEY=your_passkey
```
- Users will only see Till option
- Best for retail/marketplace businesses

### Option 3: Both (Recommended)
```env
MPESA_PAYBILL_SHORTCODE=174379
MPESA_PAYBILL_PASSKEY=your_paybill_passkey
MPESA_TILL_NUMBER=123456
MPESA_TILL_PASSKEY=your_till_passkey
```
- Users can choose their preferred method
- Maximum flexibility
- Different methods for different use cases

---

## 📱 Frontend UI Preview

When users click "Pay", they'll see:

```
┌─────────────────────────────────────┐
│  M-Pesa Payment                     │
├─────────────────────────────────────┤
│  Payment Details:                   │
│  KES 15,000                        │
│  MyGF 1.3 Subscription             │
├─────────────────────────────────────┤
│  Payment Method                     │
│                                     │
│  ○ Paybill                         │
│    Best for subscriptions and bills │
│    Paybill: 174379                 │
│                                     │
│  ● Till Number (Buy Goods)         │
│    Best for retail purchases       │
│    Till: 123456                    │
├─────────────────────────────────────┤
│  M-Pesa Phone Number               │
│  [0712345678              ]        │
│  Will be sent to: 254712345678     │
├─────────────────────────────────────┤
│  [   Pay with M-Pesa  →   ]       │
│                                     │
│  You'll receive an STK push        │
│  notification on your phone        │
└─────────────────────────────────────┘
```

---

## 🎯 When to Use Each Method

### Use Paybill When:
- ✅ Monthly subscriptions (MyGF plans)
- ✅ Recurring bill payments
- ✅ Utility payments
- ✅ Membership fees
- ✅ Service fees

### Use Till Number When:
- ✅ Property bookings/deposits
- ✅ One-time purchases
- ✅ Retail transactions
- ✅ Marketplace payments
- ✅ Service requests

---

## ⚙️ Technical Details

### Backend Files Modified
1. ✅ `backend/services/mpesaService.js` - Core payment logic
2. ✅ `backend/models/Payment.js` - Added mpesaMode field
3. ✅ `backend/controllers/payments.js` - Updated endpoints
4. ✅ `backend/routes/payments.js` - Added methods endpoint
5. ✅ `backend/.env` - New configuration structure
6. ✅ `backend/.env.example` - Updated documentation

### Frontend Files Modified
1. ✅ `frontend/services/paymentService.ts` - Added method types
2. ✅ `frontend/components/modals/MpesaPaymentModal.tsx` - UI for selection

### Database Changes
- ✅ Payment documents now include `mpesaMode: 'paybill' | 'till'`
- ✅ Backward compatible (defaults to 'paybill')
- ✅ No migration needed for existing data

---

## 🔐 Security Notes

- ✅ Both payment methods use same OAuth authentication
- ✅ Callback signature verification works for both
- ✅ Separate passkeys for Paybill and Till
- ✅ Transaction validation applies to both
- ✅ Payment mode stored in database for audit

---

## 📝 Next Steps

### To Enable Till Number:

1. **Get Till Number Credentials from Safaricom**
   - Go to: https://developer.safaricom.co.ke/
   - Create Till Number API credentials
   - Get Till Number and Passkey

2. **Update .env File**
   ```env
   MPESA_TILL_NUMBER=your_till_number
   MPESA_TILL_PASSKEY=your_till_passkey
   ```

3. **Restart Backend**
   ```bash
   # Backend will automatically detect Till configuration
   # Users will see both options in payment modal
   ```

4. **Test**
   - Make a test payment
   - Select "Till Number" option
   - Complete payment on phone
   - Verify in payment history

---

## ✅ Success Criteria

The implementation is successful when:

- ✅ Backend starts without errors
- ✅ `GET /api/payments/methods` returns configured methods
- ✅ Payment modal shows available options
- ✅ Users can select payment method
- ✅ Paybill payments work correctly
- ✅ Till payments work correctly (when configured)
- ✅ Payment history shows `mpesaMode` field
- ✅ M-Pesa STK push received on phone
- ✅ Payment completion updates database

---

## 🐛 Troubleshooting

### Payment Methods Not Showing
**Problem**: Modal doesn't show payment method selector

**Solution**:
1. Check backend logs: `✓ M-Pesa service initialized (sandbox mode)`
2. Check payment methods: `Payment methods: Paybill` or `Payment methods: Paybill + Till`
3. Verify `.env` has correct credentials

### Till Payments Failing
**Problem**: Till payments return error

**Solutions**:
1. Verify Till Number is correct (6 digits)
2. Verify Till Passkey is correct
3. Check M-Pesa sandbox supports Till (it may not in sandbox)
4. Use production credentials for Till testing

### Only Paybill Showing
**Expected Behavior**: If only Paybill is configured, only Paybill will show

**To Show Both**:
- Add Till Number credentials to `.env`
- Restart backend
- Both options will appear

---

## 📚 Resources

- **Safaricom Daraja**: https://developer.safaricom.co.ke/
- **M-Pesa API Docs**: https://developer.safaricom.co.ke/APIs
- **Test Credentials**: https://developer.safaricom.co.ke/test_credentials
- **Support**: https://developer.safaricom.co.ke/support

---

**Status**: 🟢 **COMPLETE** - Ready for testing and deployment!

Both Paybill and Till Number support has been successfully integrated. Users can now choose their preferred M-Pesa payment method!
