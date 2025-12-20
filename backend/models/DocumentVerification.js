const mongoose = require('mongoose');

const DocumentVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    documentType: {
        type: String,
        enum: ['title_deed', 'sale_agreement', 'id_document', 'other'],
        required: [true, 'Document type is required'],
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'potential_issue', 'failed'],
        default: 'pending',
    },
    extractedData: {
        ownerName: String,
        lrNumber: String,
        size: String,
        location: String,
    },
    aiAnalysis: {
        structureValid: {
            type: Boolean,
            default: false,
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
        },
        issues: [String],
        recommendations: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    verifiedAt: Date,
});

// Index for faster queries
DocumentVerificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DocumentVerification', DocumentVerificationSchema);
