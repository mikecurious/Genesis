const mongoose = require('mongoose');

const PendingWhatsAppSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    messages: [
        {
            role: { type: String, default: 'user' },
            text: { type: String, default: '' },
            message: { type: String, default: '' },
            channel: { type: String, default: 'whatsapp' },
            direction: { type: String, default: 'inbound' },
            timestamp: { type: Date, default: Date.now },
            metadata: {
                from: { type: String, default: null },
                to: { type: String, default: null },
                messageSid: { type: String, default: null },
                waId: { type: String, default: null },
                profileName: { type: String, default: null }
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

PendingWhatsAppSchema.index({ phoneNumber: 1, updatedAt: -1 });

module.exports = mongoose.model('PendingWhatsApp', PendingWhatsAppSchema);
