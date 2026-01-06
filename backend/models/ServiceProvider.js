const mongoose = require('mongoose');

const ServiceProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a provider name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    specialty: {
        type: String,
        enum: ['Plumbing', 'Electrical', 'General', 'HVAC', 'Carpentry', 'Painting', 'Roofing', 'Landscaping', 'Cleaning', 'Security', 'Other'],
        required: [true, 'Please specify a specialty']
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    availability: {
        type: String,
        enum: ['Available', 'Busy', 'Inactive'],
        default: 'Available'
    },
    yearsOfExperience: {
        type: Number,
        min: 0,
        default: 0
    },
    certifications: [{
        type: String
    }],
    serviceArea: {
        type: String, // Geographic area they serve
        default: ''
    },
    hourlyRate: {
        type: Number,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    // Who added this provider
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Company/Business name (optional)
    companyName: {
        type: String,
        default: ''
    },
    // Profile image URL
    imageUrl: {
        type: String,
        default: ''
    },
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    // Statistics
    completedJobs: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    // Reviews
    reviews: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
ServiceProviderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate average rating from reviews
ServiceProviderSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.rating = 0;
        return 0;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    // Keep rating as a number for aggregations/analytics; store to 1dp
    const average = Number((sum / this.reviews.length).toFixed(1));
    this.rating = average;
    return average;
};

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
