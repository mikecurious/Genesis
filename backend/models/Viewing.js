const mongoose = require('mongoose');

const ViewingSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lead',
        required: true
    },
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true
    },
    scheduledBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // Property owner/agent
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'],
        default: 'scheduled'
    },
    isAIGenerated: {
        type: Boolean,
        default: false
    },
    aiReasoning: {
        type: String // Why AI scheduled this viewing
    },
    attendees: [{
        name: String,
        email: String,
        phone: String,
        role: {
            type: String,
            enum: ['lead', 'agent', 'owner', 'companion']
        }
    }],
    location: {
        type: String // Property address or virtual meeting link
    },
    viewingType: {
        type: String,
        enum: ['in_person', 'virtual', 'self_guided'],
        default: 'in_person'
    },
    confirmation: {
        leadConfirmed: {
            type: Boolean,
            default: false
        },
        leadConfirmedAt: Date,
        agentConfirmed: {
            type: Boolean,
            default: false
        },
        agentConfirmedAt: Date
    },
    reminders: [{
        sentAt: Date,
        type: {
            type: String,
            enum: ['email', 'sms', 'whatsapp', 'push']
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'failed']
        }
    }],
    outcome: {
        interested: Boolean,
        feedback: String,
        nextSteps: String,
        readyToNegotiate: Boolean
    },
    notes: {
        type: String
    },
    rescheduledFrom: {
        type: mongoose.Schema.ObjectId,
        ref: 'Viewing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps on save
ViewingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for efficient querying
ViewingSchema.index({ lead: 1, scheduledDate: -1 });
ViewingSchema.index({ property: 1, scheduledDate: -1 });
ViewingSchema.index({ status: 1, scheduledDate: 1 });
ViewingSchema.index({ scheduledDate: 1 }); // For reminder cron jobs

module.exports = mongoose.model('Viewing', ViewingSchema);
