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
        minlength: 6,
        select: false, // Do not return password by default
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
    unit: { // The specific unit the tenant rents
        type: String,
    },
    rentStatus: {
        type: String,
        enum: ['Paid', 'Due', 'Overdue'],
        default: 'Due',
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
            enum: ['Basic', 'MyGF 1.3', 'MyGF 3.2', 'None'],
            default: 'None',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'inactive',
        },
        expiresAt: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

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
