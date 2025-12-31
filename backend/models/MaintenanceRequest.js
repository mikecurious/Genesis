
const mongoose = require('mongoose');

const MaintenanceRequestSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Progress', 'Resolved', 'Cancelled'],
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
    // AI Analysis Fields
    aiAnalysis: {
        category: {
            type: String,
            enum: ['Plumbing', 'Electrical', 'HVAC', 'Structural', 'Appliance', 'Pest Control', 'Painting', 'Flooring', 'Other'],
        },
        urgencyScore: {
            type: Number, // 0-100
            min: 0,
            max: 100,
        },
        estimatedCost: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'KSh'
            }
        },
        timeEstimate: {
            value: Number, // in hours
            unit: {
                type: String,
                enum: ['hours', 'days', 'weeks'],
                default: 'hours'
            }
        },
        recommendedAction: String,
        analyzedAt: Date,
    },
    // Image Analysis
    images: [{
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        aiDescription: String, // AI-generated description from Gemini Vision
    }],
    // Technician Assignment
    assignedTechnician: {
        type: mongoose.Schema.ObjectId,
        ref: 'Technician',
    },
    technicianNotes: String,
    completedAt: Date,
    // Costs
    actualCost: Number,
    // Feedback
    tenantRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    tenantFeedback: String,
});

// Indexes for performance
MaintenanceRequestSchema.index({ tenant: 1, status: 1 }); // Tenant's requests by status
MaintenanceRequestSchema.index({ landlord: 1, status: 1 }); // Landlord's requests by status
MaintenanceRequestSchema.index({ status: 1, priority: 1, submittedDate: -1 }); // Filter and sort
MaintenanceRequestSchema.index({ property: 1, status: 1 }); // Property's requests by status

module.exports = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);
