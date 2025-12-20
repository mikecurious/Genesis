
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

module.exports = mongoose.model('Lead', LeadSchema);
