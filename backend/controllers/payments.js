const Payment = require('../models/Payment');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const mpesaService = require('../services/mpesaService');
const twilioService = require('../services/twilioService');

const planPrices = {
    'Basic': 1,
    'MyGF 1.3': 1,
    'MyGF 3.2': 1
};

// Helper function to generate payment receipt HTML
const generatePaymentReceiptHTML = (payment, user) => {
    const formattedDate = payment.transactionDate
        ? new Date(payment.transactionDate).toLocaleString('en-KE', {
            dateStyle: 'full',
            timeStyle: 'short'
          })
        : new Date().toLocaleString('en-KE', {
            dateStyle: 'full',
            timeStyle: 'short'
          });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .receipt-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
                .receipt-row:last-child { border-bottom: none; }
                .label { font-weight: 600; color: #666; }
                .value { color: #333; }
                .amount { font-size: 24px; color: #667eea; font-weight: bold; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Payment Successful!</h1>
                    <p>Thank you for your payment</p>
                </div>
                <div class="content">
                    <div class="success">
                        ✅ Your payment has been processed successfully
                    </div>

                    <div class="receipt-box">
                        <h2 style="margin-top: 0; color: #667eea;">Payment Receipt</h2>

                        <div class="receipt-row">
                            <span class="label">Receipt Number:</span>
                            <span class="value"><strong>${payment.mpesaReceiptNumber || 'N/A'}</strong></span>
                        </div>

                        <div class="receipt-row">
                            <span class="label">Transaction ID:</span>
                            <span class="value">${payment._id}</span>
                        </div>

                        <div class="receipt-row">
                            <span class="label">Date & Time:</span>
                            <span class="value">${formattedDate}</span>
                        </div>

                        <div class="receipt-row">
                            <span class="label">Amount Paid:</span>
                            <span class="value amount">KSh ${payment.amount.toLocaleString()}</span>
                        </div>

                        ${payment.plan ? `
                        <div class="receipt-row">
                            <span class="label">Subscription Plan:</span>
                            <span class="value"><strong>${payment.plan}</strong></span>
                        </div>
                        ` : ''}

                        <div class="receipt-row">
                            <span class="label">Payment Method:</span>
                            <span class="value">M-Pesa (${payment.mpesaMode || 'paybill'})</span>
                        </div>

                        <div class="receipt-row">
                            <span class="label">Phone Number:</span>
                            <span class="value">${payment.phoneNumber}</span>
                        </div>

                        <div class="receipt-row">
                            <span class="label">Status:</span>
                            <span class="value" style="color: #28a745; font-weight: bold;">✓ COMPLETED</span>
                        </div>
                    </div>

                    ${payment.paymentType === 'subscription' && payment.plan ? `
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong>🚀 Your ${payment.plan} subscription is now active!</strong>
                        <p style="margin: 10px 0 0 0;">Enjoy all premium features. Valid until: ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-KE', { dateStyle: 'long' })}</p>
                    </div>
                    ` : ''}

                    <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p><strong>MyGF AI</strong> - Your Smart Real Estate Platform</p>
                    <p>This is an automated receipt. Please keep for your records.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// @desc    Get available M-Pesa payment methods
// @route   GET /api/payments/methods
// @access  Public
exports.getPaymentMethods = asyncHandler(async (req, res, next) => {
    const methods = mpesaService.getAvailablePaymentMethods();

    res.status(200).json({
        success: true,
        data: methods
    });
});

// @desc    Initiate a subscription payment
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res, next) => {
    let { plan, phoneNumber, mpesaMode } = req.body;
    const amount = planPrices[plan];

    // Default to paybill if not specified
    mpesaMode = mpesaMode || 'paybill';

    // Validate mpesaMode
    if (!['paybill', 'till'].includes(mpesaMode)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment mode. Use "paybill" or "till"'
        });
    }

    if (!amount) {
        return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Normalize phone number (remove + and non-numeric characters)
    phoneNumber = phoneNumber.replace(/\D/g, '');

    // Validate phone number format (254XXXXXXXXX)
    if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid Kenyan phone number (e.g., 254712345678, +254712345678, or 0712345678)'
        });
    }

    // Create payment record
    const payment = await Payment.create({
        user: req.user._id,
        phoneNumber,
        amount,
        plan,
        paymentType: 'subscription',
        mpesaMode,
        status: 'pending',
    });

    // Initiate STK Push with payment mode
    const stkResult = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        `SUB-${req.user._id}`,
        `${plan} Subscription`,
        mpesaMode
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

    console.log(`✅ Payment initiated successfully:`, {
        paymentId: payment._id,
        checkoutRequestID: stkResult.checkoutRequestID,
        phoneNumber: phoneNumber,
        amount: amount,
        status: 'processing'
    });

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

            // Send multi-channel payment confirmation
            try {
                const user = payment.user;

                // Prepare confirmation message
                const smsMessage = `✅ Payment received!\n\nAmount: KSh ${payment.amount}\nReceipt: ${payment.mpesaReceiptNumber}\n${payment.paymentType === 'subscription' ? `\n🚀 ${payment.plan} subscription activated!` : ''}\n\nThank you for using MyGF AI!`;

                const whatsappMessage = `*✅ Payment Successful!*\n\n💰 *Amount:* KSh ${payment.amount.toLocaleString()}\n📝 *Receipt:* ${payment.mpesaReceiptNumber}\n📅 *Date:* ${new Date().toLocaleDateString('en-KE')}\n${payment.paymentType === 'subscription' ? `\n🚀 *${payment.plan} subscription* is now active!` : ''}\n\nThank you for choosing MyGF AI! 🏠`;

                // Send multi-channel notification (WhatsApp → SMS → Email fallback)
                await twilioService.sendMultiChannelNotification({
                    phone: user.phone,
                    email: user.email,
                    message: smsMessage,
                    whatsappMessage: whatsappMessage,
                    subject: `Payment Confirmation - KSh ${payment.amount}`,
                    htmlEmail: generatePaymentReceiptHTML(payment, user)
                });

                console.log(`📧 Payment confirmation sent to ${user.email} (${user.phone})`);
            } catch (notificationError) {
                console.error('Failed to send payment confirmation:', notificationError);
                // Don't fail the payment if notification fails
            }
        } else {
            // Payment failed
            payment.status = 'failed';
            await payment.save();
            console.log(`❌ Payment failed: ${callbackResult.resultDesc}`);

            // Send payment failure notification
            try {
                const user = payment.user;

                const failureMessage = `❌ Payment Failed\n\nAmount: KSh ${payment.amount}\nReason: ${callbackResult.resultDesc}\n\nPlease try again or contact support if issue persists.\n\nMyGF AI`;

                // Send SMS notification for failed payment
                await twilioService.sendSMS({
                    to: user.phone,
                    message: failureMessage
                });

                console.log(`📧 Payment failure notification sent to ${user.phone}`);
            } catch (notificationError) {
                console.error('Failed to send payment failure notification:', notificationError);
            }
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

    console.log(`📊 Payment status query for ${req.params.paymentId}: ${payment?.status || 'NOT_FOUND'}`);

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
        console.log(`🔍 Payment still processing, querying M-Pesa for CheckoutRequestID: ${payment.checkoutRequestID}`);

        const queryResult = await mpesaService.querySTKPush(
            payment.checkoutRequestID,
            payment.mpesaMode || 'paybill'
        );

        console.log(`📥 M-Pesa query result:`, {
            success: queryResult.success,
            resultCode: queryResult.resultCode,
            resultDesc: queryResult.resultDesc
        });

        if (queryResult.success) {
            // Update payment status based on query result
            if (queryResult.resultCode === '0') {
                payment.status = 'completed';
                payment.resultCode = queryResult.resultCode;
                payment.resultDesc = queryResult.resultDesc;
                await payment.save();
                console.log(`✅ Payment completed via query: ${payment._id}`);

                // Send payment confirmation (since callback might have been missed)
                try {
                    const user = await User.findById(payment.user);
                    if (user) {
                        const smsMessage = `✅ Payment confirmed!\n\nAmount: KSh ${payment.amount}\nTransaction ID: ${payment._id}\n${payment.paymentType === 'subscription' ? `\n🚀 ${payment.plan} subscription activated!` : ''}\n\nThank you!`;

                        await twilioService.sendSMS({
                            to: user.phone,
                            message: smsMessage
                        });

                        console.log(`📧 Late payment confirmation sent to ${user.phone}`);
                    }
                } catch (notificationError) {
                    console.error('Failed to send late payment confirmation:', notificationError);
                }
            } else if (queryResult.resultCode !== '0' && queryResult.resultCode !== '1032') {
                // 1032 = Request cancelled by user, keep as processing
                payment.status = 'failed';
                payment.resultCode = queryResult.resultCode;
                payment.resultDesc = queryResult.resultDesc;
                await payment.save();
                console.log(`❌ Payment failed via query: ${payment._id} - ${queryResult.resultDesc}`);

                // Send failure notification
                try {
                    const user = await User.findById(payment.user);
                    if (user) {
                        const failureMessage = `❌ Payment Failed\n\nAmount: KSh ${payment.amount}\nReason: ${queryResult.resultDesc}\n\nPlease try again.`;

                        await twilioService.sendSMS({
                            to: user.phone,
                            message: failureMessage
                        });

                        console.log(`📧 Payment failure notification sent to ${user.phone}`);
                    }
                } catch (notificationError) {
                    console.error('Failed to send payment failure notification:', notificationError);
                }
            } else {
                console.log(`⏳ Payment still pending (code ${queryResult.resultCode}), continuing to wait...`);
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
    let { phoneNumber, amount, paymentType, description, metadata, mpesaMode } = req.body;

    // Default to paybill if not specified
    mpesaMode = mpesaMode || 'paybill';

    // Validate mpesaMode
    if (!['paybill', 'till'].includes(mpesaMode)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment mode. Use "paybill" or "till"'
        });
    }

    // Normalize phone number (remove + and non-numeric characters)
    phoneNumber = phoneNumber.replace(/\D/g, '');

    // Validate phone number format (254XXXXXXXXX)
    if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid Kenyan phone number (e.g., 254712345678, +254712345678, or 0712345678)'
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
        mpesaMode,
        status: 'pending',
        metadata: metadata || {},
    });

    // Initiate STK Push with payment mode
    const stkResult = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        `PAY-${req.user._id}-${Date.now()}`,
        description || 'Payment',
        mpesaMode
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

    console.log(`✅ Payment initiated successfully:`, {
        paymentId: payment._id,
        checkoutRequestID: stkResult.checkoutRequestID,
        phoneNumber: phoneNumber,
        amount: amount,
        status: 'processing'
    });

    res.status(200).json({
        success: true,
        message: stkResult.customerMessage || 'Payment initiated. Please check your phone to complete the transaction.',
        checkoutRequestID: stkResult.checkoutRequestID,
        paymentId: payment._id,
    });
});
