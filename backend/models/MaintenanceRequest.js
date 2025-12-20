
const mongoose = require('mongoose');

const MaintenanceRequestSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Progress', 'Resolved'],
        default: 'Submitted',
    },
    tenant: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    submittedDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);
