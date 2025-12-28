const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a phone number'],
        match: [/^254\d{9}$/, 'Please provide a valid Kenyan phone number (254...)'],
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
        min: [1, 'Amount must be at least 1 KES'],
    },
    plan: {
        type: String,
        enum: ['Basic', 'MyGF 1.3', 'MyGF 3.2', 'None'],
        default: null,
        required: false,  // Make it optional
    },
    // M-Pesa STK Push fields
    merchantRequestID: {
        type: String,
        default: null,
    },
    checkoutRequestID: {
        type: String,
        default: null,
        index: true,
    },
    mpesaReceiptNumber: {
        type: String,
        default: null,
        sparse: true,
    },
    transactionDate: {
        type: Date,
        default: null,
    },
    transactionId: { // Backward compatibility
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
    },
    resultCode: {
        type: String,
        default: null,
    },
    resultDesc: {
        type: String,
        default: null,
    },
    paymentType: {
        type: String,
        enum: ['subscription', 'property', 'service', 'tenant_payment', 'other'],
        default: 'subscription',
    },
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'card', 'bank'],
        default: 'mpesa',
    },
    mpesaMode: {
        type: String,
        enum: ['paybill', 'till'],
        default: 'paybill',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for faster queries
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });

// Update the updatedAt timestamp before saving
PaymentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
