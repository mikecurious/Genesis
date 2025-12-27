
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
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
    },
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
    },
    landlord: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
});

// Indexes for performance
MaintenanceRequestSchema.index({ tenant: 1, status: 1 }); // Tenant's requests by status
MaintenanceRequestSchema.index({ landlord: 1, status: 1 }); // Landlord's requests by status
MaintenanceRequestSchema.index({ status: 1, priority: 1, submittedDate: -1 }); // Filter and sort
MaintenanceRequestSchema.index({ property: 1, status: 1 }); // Property's requests by status

module.exports = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);
