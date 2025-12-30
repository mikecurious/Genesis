
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true,
    },
    client: {
        name: {
            type: String,
            required: [true, 'Please add client name'],
        },
        address: {
            type: String,
            required: [true, 'Please add client address'],
        },
        contact: {
            type: String,
            required: [true, 'Please add client contact'],
        },
        email: {
            type: String,
            required: [true, 'Please add client email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        whatsappNumber: {
            type: String,
            required: [true, 'Please add client WhatsApp number'],
        },
    },
    dealType: {
        type: String,
        enum: ['purchase', 'rental', 'viewing'],
        required: true,
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'in-progress', 'closed', 'lost'],
        default: 'new',
    },
    conversationHistory: {
        type: Array,
        default: [],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    notes: {
        type: String,
    },
    // Lead Scoring Fields
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    scoreBreakdown: {
        responseTime: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        budgetMatch: { type: Number, default: 0 },
        urgency: { type: Number, default: 0 },
        contactQuality: { type: Number, default: 0 },
    },
    buyingIntent: {
        type: String,
        enum: ['low', 'medium', 'high', 'very-high'],
        default: 'medium',
    },
    lastFollowUpDate: {
        type: Date,
    },
    nextFollowUpDate: {
        type: Date,
    },
    followUpCount: {
        type: Number,
        default: 0,
    },
    autoFollowUpEnabled: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    closedAt: {
        type: Date,
    },
});

// Indexes
LeadSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
LeadSchema.index({ property: 1 });
LeadSchema.index({ 'client.email': 1, property: 1 }, { unique: true }); // Prevent duplicate leads
LeadSchema.index({ status: 1, createdAt: -1 }); // Filter by status, sort by date
LeadSchema.index({ property: 1, createdAt: -1 }); // Property's leads, sorted by date
LeadSchema.index({ dealType: 1, status: 1 }); // Filter by deal type and status
LeadSchema.index({ score: -1 }); // Sort by lead score
LeadSchema.index({ buyingIntent: 1, score: -1 }); // Filter by intent, sort by score
LeadSchema.index({ nextFollowUpDate: 1, autoFollowUpEnabled: 1 }); // For follow-up scheduling

module.exports = mongoose.model('Lead', LeadSchema);
