const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ChatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true,
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for performance
ChatSchema.index({ participants: 1, createdAt: -1 }); // Find chats by participant, sorted by date
ChatSchema.index({ property: 1, createdAt: -1 }); // Find chats by property, sorted by date
ChatSchema.index({ 'messages.timestamp': -1 }); // Sort messages by timestamp

module.exports = mongoose.model('Chat', ChatSchema);
