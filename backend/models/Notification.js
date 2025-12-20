const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['lead_captured', 'viewing_booked', 'purchase_inquiry', 'rental_inquiry', 'property_boosted', 'system', 'reminder', 'follow-up', 'booking', 'announcement', 'message'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    metadata: {
        leadId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Lead'
        },
        propertyId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Property'
        },
        dealType: String,
        clientName: String,
        link: String // Optional link for backward compatibility
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('Notification', NotificationSchema);
