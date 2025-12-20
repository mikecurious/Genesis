const Payment = require('../models/Payment');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const planPrices = {
    'Basic': 1000,
    'MyGF 1.3': 2500,
    'MyGF 3.2': 5000
};

// @desc    Initiate a subscription payment
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res, next) => {
    const { plan, phone } = req.body;
    const amount = planPrices[plan];

    if (!amount) {
        return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // --- M-PESA STK PUSH INTEGRATION LOGIC ---
    // 1. Get an access token from Safaricom API.
    // 2. Format the STK Push request body (BusinessShortCode, Timestamp, TransactionType, Amount, PartyA, PartyB, PhoneNumber, etc.).
    // 3. Make a POST request to the Safaricom STK Push endpoint.
    // 4. Handle the response. If successful, Safaricom will send a callback to your /mpesa-callback route.
    
    console.log(`Simulating M-Pesa STK Push to ${phone} for ${plan} plan (Amount: ${amount} KSh)`);
    
    // For now, we'll just send a success response to the client.
    // The actual subscription update happens in the callback.
    res.status(200).json({ 
        success: true, 
        message: 'Payment initiated. Please check your phone to complete the transaction.' 
    });
});

// @desc    M-Pesa Callback Webhook
// @route   POST /api/payments/mpesa-callback
// @access  Public (from Safaricom)
exports.mpesaCallback = asyncHandler(async (req, res, next) => {
    // This is a placeholder for the complex callback logic.
    console.log('--- M-PESA CALLBACK RECEIVED ---');
    console.log(JSON.stringify(req.body, null, 2));

    const callbackData = req.body.Body.stkCallback;
    const resultCode = callbackData.ResultCode;

    if (resultCode === 0) {
        // Payment was successful
        const metaData = callbackData.CallbackMetadata.Item;
        const amount = metaData.find(o => o.Name === 'Amount').Value;
        const transactionId = metaData.find(o => o.Name === 'MpesaReceiptNumber').Value;
        const phoneNumber = metaData.find(o => o.Name === 'PhoneNumber').Value;

        // Find the user by phone number (you might need to store this temporarily when they initiate)
        const user = await User.findOne({ phone: phoneNumber }); // This is a simplification
        if (!user) {
            console.error('Callback received for a user not found with phone:', phoneNumber);
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        // Determine plan from amount
        const plan = Object.keys(planPrices).find(key => planPrices[key] === amount);

        // Create Payment record
        await Payment.create({
            user: user._id,
            plan,
            amount,
            transactionId,
            status: 'success'
        });

        // Update user's subscription status
        user.subscription.plan = plan;
        user.subscription.status = 'active';
        user.subscription.expiresAt = new Date(new Date().setMonth(new Date().getMonth() + 1));
        await user.save();
        
        console.log(`Successfully updated subscription for ${user.email} to ${plan} plan.`);
    }

    // Acknowledge receipt to Safaricom
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});
