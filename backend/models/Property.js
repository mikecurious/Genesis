
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be a positive number'],
    },
    currency: {
        type: String,
        enum: ['KSh', 'USD', 'EUR', 'GBP'],
        default: 'KSh',
        required: true,
    },
    priceType: {
        type: String,
        enum: ['sale', 'rental'],
        required: [true, 'Please specify if this is for sale or rental'],
        default: 'sale',
    },
    imageUrls: {
        type: [String],
        validate: [v => v.length <= 5, 'You can upload a maximum of 5 images.'],
        required: true,
    },
    tags: {
        type: [String],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'rented'],
        default: 'active',
    },
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'approved', // Auto-approve by default, admin can flag later
    },
    moderatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    moderatedAt: {
        type: Date,
        default: null,
    },
    moderationNote: {
        type: String,
        default: null,
    },
    documentsUploaded: {
        type: Boolean,
        default: false,
    },
    documentsUploadedAt: {
        type: Date,
        default: null,
    },
    boosted: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    // AI-ready fields for smart queries
    embedding: {
        type: [Number],
        select: false, // Don't return by default to save bandwidth
    },
    semanticTags: {
        type: [String],
        default: [],
    },
    // Structured property details for precise filtering
    bedrooms: {
        type: Number,
        min: 0,
    },
    bathrooms: {
        type: Number,
        min: 0,
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'condo', 'villa', 'studio', 'townhouse', 'land', 'commercial', 'other'],
    },
    amenities: {
        type: [String],
        default: [],
    },
    squareFeet: {
        type: Number,
        min: 0,
    },
    yearBuilt: {
        type: Number,
    },
    // Surveyor Attachment
    surveyorAttachedAt: {
        type: Date,
        default: null,
    },
    surveyorNotes: {
        type: String,
        default: null,
    },
    surveyStatus: {
        type: String,
        enum: ['not-requested', 'pending', 'in-progress', 'completed'],
        default: 'not-requested',
    },
    surveyCompletedAt: {
        type: Date,
        default: null,
    },
    // Attached Surveyor
    attachedSurveyor: {
        surveyor: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        surveyType: {
            type: String,
            enum: ['inspection', 'valuation', 'compliance', 'general'],
            default: 'general'
        },
        attachedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'],
            default: 'pending'
        },
        scheduledDate: Date,
        completedDate: Date,
        report: {
            url: String,
            uploadedAt: Date
        },
        notes: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for efficient querying
PropertySchema.index({ location: 'text', title: 'text', description: 'text' });
PropertySchema.index({ status: 1, boosted: -1, createdAt: -1 });
PropertySchema.index({ bedrooms: 1, bathrooms: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ priceType: 1 }); // NEW: Index for sale vs rental filtering
PropertySchema.index({ semanticTags: 1 });
PropertySchema.index({ 'attachedSurveyor.surveyor': 1 }); // For surveyor's assigned properties
PropertySchema.index({ surveyStatus: 1 }); // Filter by survey status

module.exports = mongoose.model('Property', PropertySchema);
