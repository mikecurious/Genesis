const mongoose = require('mongoose');

const ValuationRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    propertyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
    },
    propertyDetails: {
        location: String,
        size: String,
        type: String,
    },
    documentUrls: [String],
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    estimatedValue: {
        amount: Number,
        currency: {
            type: String,
            default: 'KES',
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
        },
        comparables: [mongoose.Schema.Types.Mixed],
    },
    valuationReport: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
});

// Index for faster queries
ValuationRequestSchema.index({ userId: 1, createdAt: -1 });
ValuationRequestSchema.index({ status: 1 });

module.exports = mongoose.model('ValuationRequest', ValuationRequestSchema);
