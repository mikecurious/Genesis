const mongoose = require('mongoose');

const SurveyTaskSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: [true, 'Property ID is required'],
    },
    requestedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Requester ID is required'],
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    scheduledDate: Date,
    completedDate: Date,
    location: {
        address: {
            type: String,
            required: [true, 'Location address is required'],
        },
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    requirements: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
SurveyTaskSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
SurveyTaskSchema.index({ status: 1, assignedTo: 1 });
SurveyTaskSchema.index({ requestedBy: 1, createdAt: -1 });
SurveyTaskSchema.index({ propertyId: 1 });

module.exports = mongoose.model('SurveyTask', SurveyTaskSchema);
