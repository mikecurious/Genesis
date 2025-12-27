const Payment = require('../models/Payment');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const mpesaService = require('../services/mpesaService');

const planPrices = {
    'Basic': 10000,
    'MyGF 1.3': 15000,
    'MyGF 3.2': 25000
};

// @desc    Initiate a subscription payment
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res, next) => {
    const { plan, phoneNumber } = req.body;
    const amount = planPrices[plan];

    if (!amount) {
        return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Validate phone number format (254XXXXXXXXX)
    if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid phone number in format 254XXXXXXXXX'
        });
    }

    // Create payment record
    const payment = await Payment.create({
        user: req.user._id,
        phoneNumber,
        amount,
        plan,
        paymentType: 'subscription',
        status: 'pending',
    });

    // Initiate STK Push
    const stkResult = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        `SUB-${req.user._id}`,
        `${plan} Subscription`
    );

    if (!stkResult.success) {
        payment.status = 'failed';
        payment.resultDesc = stkResult.error;
        await payment.save();

        return res.status(500).json({
            success: false,
            message: 'Failed to initiate payment. Please try again.'
        });
    }

    // Update payment with M-Pesa response
    payment.merchantRequestID = stkResult.merchantRequestID;
    payment.checkoutRequestID = stkResult.checkoutRequestID;
    payment.status = 'processing';
    await payment.save();

    res.status(200).json({
        success: true,
        message: stkResult.customerMessage || 'Payment initiated. Please check your phone to complete the transaction.',
        checkoutRequestID: stkResult.checkoutRequestID,
        paymentId: payment._id,
    });
});

// @desc    M-Pesa Callback Webhook
// @route   POST /api/payments/mpesa-callback
// @access  Public (from Safaricom)
exports.mpesaCallback = asyncHandler(async (req, res, next) => {
    console.log('--- M-PESA CALLBACK RECEIVED ---');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        // Process callback data using M-Pesa service
        const callbackResult = mpesaService.processCallback(req.body);

        // Find payment by checkoutRequestID
        const payment = await Payment.findOne({
            checkoutRequestID: callbackResult.checkoutRequestID
        }).populate('user');

        if (!payment) {
            console.error('Payment not found for CheckoutRequestID:', callbackResult.checkoutRequestID);
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        // Update payment record
        payment.resultCode = String(callbackResult.resultCode);
        payment.resultDesc = callbackResult.resultDesc;

        if (callbackResult.resultCode === 0) {
            // Payment successful
            payment.status = 'completed';
            payment.mpesaReceiptNumber = callbackResult.mpesaReceiptNumber;
            payment.transactionId = callbackResult.mpesaReceiptNumber; // Backward compatibility
            payment.transactionDate = callbackResult.transactionDate ? new Date(String(callbackResult.transactionDate)) : new Date();

            await payment.save();

            // Update user subscription if payment type is subscription
            if (payment.paymentType === 'subscription' && payment.plan) {
                const user = payment.user;
                user.subscription.plan = payment.plan;
                user.subscription.status = 'active';
                user.subscription.expiresAt = new Date(new Date().setMonth(new Date().getMonth() + 1));
                await user.save();

                console.log(`✅ Successfully updated subscription for ${user.email} to ${payment.plan} plan.`);
            }

            console.log(`✅ Payment completed: ${callbackResult.mpesaReceiptNumber}`);
        } else {
            // Payment failed
            payment.status = 'failed';
            await payment.save();
            console.log(`❌ Payment failed: ${callbackResult.resultDesc}`);
        }
    } catch (error) {
        console.error('Callback processing error:', error);
    }

    // Always acknowledge receipt to Safaricom
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// @desc    Query payment status
// @route   GET /api/payments/:paymentId/status
// @access  Private
exports.queryPaymentStatus = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Payment not found'
        });
    }

    // Verify payment belongs to user
    if (payment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this payment'
        });
    }

    // If payment is still processing, query M-Pesa
    if (payment.status === 'processing' && payment.checkoutRequestID) {
        const queryResult = await mpesaService.querySTKPush(payment.checkoutRequestID);

        if (queryResult.success) {
            // Update payment status based on query result
            if (queryResult.resultCode === '0') {
                payment.status = 'completed';
                payment.resultCode = queryResult.resultCode;
                payment.resultDesc = queryResult.resultDesc;
                await payment.save();
            } else if (queryResult.resultCode !== '0' && queryResult.resultCode !== '1032') {
                // 1032 = Request cancelled by user, keep as processing
                payment.status = 'failed';
                payment.resultCode = queryResult.resultCode;
                payment.resultDesc = queryResult.resultDesc;
                await payment.save();
            }
        }
    }

    res.status(200).json({
        success: true,
        data: payment
    });
});

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
    });
});

// @desc    Initiate any payment (generic)
// @route   POST /api/payments/pay
// @access  Private
exports.initiateGenericPayment = asyncHandler(async (req, res, next) => {
    const { phoneNumber, amount, paymentType, description, metadata } = req.body;

    // Validate phone number format (254XXXXXXXXX)
    if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid phone number in format 254XXXXXXXXX'
        });
    }

    if (!amount || amount < 1) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid amount (minimum 1 KES)'
        });
    }

    // Create payment record
    const payment = await Payment.create({
        user: req.user._id,
        phoneNumber,
        amount,
        paymentType: paymentType || 'other',
        status: 'pending',
        metadata: metadata || {},
    });

    // Initiate STK Push
    const stkResult = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        `PAY-${req.user._id}-${Date.now()}`,
        description || 'Payment'
    );

    if (!stkResult.success) {
        payment.status = 'failed';
        payment.resultDesc = stkResult.error;
        await payment.save();

        return res.status(500).json({
            success: false,
            message: 'Failed to initiate payment. Please try again.'
        });
    }

    // Update payment with M-Pesa response
    payment.merchantRequestID = stkResult.merchantRequestID;
    payment.checkoutRequestID = stkResult.checkoutRequestID;
    payment.status = 'processing';
    await payment.save();

    res.status(200).json({
        success: true,
        message: stkResult.customerMessage || 'Payment initiated. Please check your phone to complete the transaction.',
        checkoutRequestID: stkResult.checkoutRequestID,
        paymentId: payment._id,
    });
});
