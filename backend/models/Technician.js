const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add technician name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    whatsappNumber: String,
    specialty: {
        type: [String],
        required: true,
        enum: ['Plumbing', 'Electrical', 'HVAC', 'Structural', 'Appliance', 'Pest Control', 'Painting', 'Flooring', 'General'],
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    totalJobs: {
        type: Number,
        default: 0,
    },
    completedJobs: {
        type: Number,
        default: 0,
    },
    availability: {
        type: String,
        enum: ['Available', 'Busy', 'Unavailable'],
        default: 'Available',
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    location: String, // City or area
    certifications: [String],
    yearsOfExperience: Number,
    profileImage: String,
    verified: {
        type: Boolean,
        default: false,
    },
    reviews: [{
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        comment: String,
        reviewedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for searching technicians
TechnicianSchema.index({ specialty: 1, availability: 1, rating: -1 });
TechnicianSchema.index({ location: 1, availability: 1 });

module.exports = mongoose.model('Technician', TechnicianSchema);
