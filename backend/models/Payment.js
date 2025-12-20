const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: String,
        enum: ['Basic', 'MyGF 1.3', 'MyGF 3.2'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionId: { // From M-Pesa or other gateway
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['success', 'pending', 'failed'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payment', PaymentSchema);
