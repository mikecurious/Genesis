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

module.exports = mongoose.model('Chat', ChatSchema);
