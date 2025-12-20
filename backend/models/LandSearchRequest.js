const mongoose = require('mongoose');

const LandSearchRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    parcelNumber: {
        type: String,
        required: [true, 'Parcel number is required'],
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
    },
    documentUrl: String,
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending',
    },
    results: {
        ownershipHistory: [String],
        encumbrances: [String],
        boundaries: String,
        additionalInfo: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
    notificationSent: {
        type: Boolean,
        default: false,
    },
});

// Index for faster queries
LandSearchRequestSchema.index({ userId: 1, createdAt: -1 });
LandSearchRequestSchema.index({ status: 1 });

module.exports = mongoose.model('LandSearchRequest', LandSearchRequestSchema);
