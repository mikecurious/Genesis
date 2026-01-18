const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
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
    password: {
        type: String,
        required: function () {
            // Password is only required for local auth, not for Google auth
            return this.authProvider === 'local';
        },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false, // Do not return password by default
        validate: {
            validator: function(password) {
                // Skip validation if authProvider is not local (Google OAuth users)
                if (this.authProvider !== 'local') return true;

                // Password must contain:
                // - At least one uppercase letter
                // - At least one lowercase letter
                // - At least one number
                // - At least one special character
                const hasUppercase = /[A-Z]/.test(password);
                const hasLowercase = /[a-z]/.test(password);
                const hasNumber = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                return hasUppercase && hasLowercase && hasNumber && hasSpecial;
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['Agent', 'Property Seller', 'Landlord', 'Tenant', 'Admin', 'Surveyor'],
        // Role is set during account setup, not during initial registration
    },
    // -- Fields for Tenant Management --
    landlordId: { // Link to the landlord who owns this tenant
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    propertyId: { // Link to the property the tenant rents
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
    },
    unit: { // The specific unit the tenant rents
        type: String,
    },
    rentAmount: { // Monthly rent amount
        type: Number,
        min: 0,
    },
    leaseStartDate: {
        type: Date,
    },
    leaseEndDate: {
        type: Date,
    },
    depositAmount: {
        type: Number,
        min: 0,
    },
    rentStatus: {
        type: String,
        enum: ['Paid', 'Due', 'Overdue'],
        default: 'Due',
    },
    lastPaymentDate: {
        type: Date,
    },
    nextPaymentDue: {
        type: Date,
    },
    // ---------------------------------
    whatsappNumber: { // Renamed from whatsAppNumber and added validation
        type: String,
        default: null,
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow null/empty
                // Basic international phone number validation
                return /^\+?[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    notificationPreferences: {
        email: {
            type: Boolean,
            default: true
        },
        whatsapp: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: true
        }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['Free', 'Basic', 'MyGF 1.3', 'MyGF 3.2', 'None'],
<<<<<<< HEAD
            default: 'Free',
=======
            default: 'None',
>>>>>>> ee4d20d9eedb8071ebde3e5ad905030c855b26db
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'inactive',
        },
        expiresAt: Date,
    },
    // Feature Control Flags
    featureFlags: {
        aiManager: {
            enabled: { type: Boolean, default: false },
            automationLevel: {
                type: String,
                enum: ['off', 'low', 'medium', 'high'],
                default: 'medium'
            }
        },
        rentReminders: {
            enabled: { type: Boolean, default: true },
            daysBeforeDue: { type: [Number], default: [7, 3, 1] },
            channels: {
                email: { type: Boolean, default: true },
                whatsapp: { type: Boolean, default: false },
                push: { type: Boolean, default: true }
            }
        },
        leadScoring: {
            enabled: { type: Boolean, default: true },
            autoFollowUp: { type: Boolean, default: true },
            followUpInterval: { type: Number, default: 2 } // days
        },
        maintenanceAI: {
            enabled: { type: Boolean, default: false },
            autoAnalysis: { type: Boolean, default: false },
            imageAnalysis: { type: Boolean, default: false } // Premium feature
        },
        financialReports: {
            enabled: { type: Boolean, default: true },
            autoGenerate: { type: Boolean, default: false },
            frequency: {
                type: String,
                enum: ['weekly', 'monthly', 'quarterly'],
                default: 'monthly'
            }
        },
        aiVoice: {
            enabled: { type: Boolean, default: false } // Premium feature
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'deactivated'],
        default: 'active',
    },
    suspendedAt: {
        type: Date,
        default: null,
    },
    suspensionReason: {
        type: String,
        default: null,
    },
    verificationToken: {
        type: String,
        select: false,
    },
    verificationTokenExpires: {
        type: Date,
        select: false,
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        select: false,
    },
    // -- Surveyor Profile Fields --
    surveyorProfile: {
        profileImage: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: 500
        },
        specializations: [{
            type: String,
            enum: ['Residential', 'Commercial', 'Land', 'Industrial', 'Agricultural', 'Mixed-Use']
        }],
        services: [{
            name: {
                type: String,
                required: true
            },
            description: String,
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        yearsOfExperience: {
            type: Number,
            min: 0,
            default: 0
        },
        certifications: [String],
        availability: {
            type: String,
            enum: ['Available', 'Busy', 'Unavailable'],
            default: 'Available'
        },
        rating: {
            type: Number,
            default: 5.0,
            min: 0,
            max: 5
        },
        completedSurveys: {
            type: Number,
            default: 0
        },
        location: {
            type: String,
            default: null
        }
    },
    // ---------------------------------
    // -- Agent Profile Fields --
    agentProfile: {
        profileImage: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: 500
        },
        specializations: [{
            type: String,
            enum: ['Residential Sales', 'Residential Rentals', 'Commercial Sales', 'Commercial Rentals', 'Land Sales', 'Property Management', 'Investment Properties', 'Luxury Properties']
        }],
        yearsOfExperience: {
            type: Number,
            min: 0,
            default: 0
        },
        serviceAreas: [String], // Locations/areas they serve
        languages: [String], // Languages they speak
        certifications: [String],
        achievements: [String], // Awards, top performer, etc.
        rating: {
            type: Number,
            default: 5.0,
            min: 0,
            max: 5
        },
        totalDeals: {
            type: Number,
            default: 0
        },
        companyCertification: {
            type: String,
            default: null
        }
    },
    // Role Intelligence - AI-powered role detection and optimization
    roleIntelligence: {
        detectedRoles: [{
            role: String,
            confidence: Number, // 0-100
            indicators: [String]
        }],
        primaryRole: String,
        isHybrid: {
            type: Boolean,
            default: false
        },
        confidenceScore: Number, // Overall confidence in role detection
        recommendations: [String], // AI-generated recommendations
        lastAnalyzed: Date
    },
    manualRoleSet: {
        type: Boolean,
        default: false // Set to true when user manually changes their role
    },
    autoRoleAssigned: {
        type: Boolean,
        default: false // Set to true when AI automatically assigns role
    },
    // ---------------------------------
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for performance optimization
UserSchema.index({ email: 1 }); // Already unique, but explicit index
UserSchema.index({ role: 1, accountStatus: 1 }); // For filtering users by role and status
UserSchema.index({ createdAt: -1 }); // For sorting by registration date
UserSchema.index({ authProvider: 1 }); // For filtering by auth method
UserSchema.index({ 'subscription.status': 1, 'subscription.expiresAt': 1 }); // For subscription queries
UserSchema.index({ landlordId: 1 }); // For tenant lookups by landlord
UserSchema.index({ propertyId: 1 }); // For tenant lookups by property
UserSchema.index({ role: 1, propertyId: 1 }); // For tenant filtering by property
UserSchema.index({ isVerified: 1 }); // For finding unverified users
UserSchema.index({ resetPasswordExpires: 1 }); // For password reset cleanup
UserSchema.index({ googleId: 1 }); // Google OAuth lookups

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash verification token
UserSchema.methods.getVerificationToken = function () {
    // For simulation, using a simple 6-digit OTP. In production, use crypto.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash token and set to field
    this.verificationToken = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Set expire time (e.g., 10 minutes)
    this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    return otp; // Return unhashed OTP to be sent to user
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (1 hour)
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    return resetToken; // Return unhashed token to be sent in email
};


module.exports = mongoose.model('User', UserSchema);
