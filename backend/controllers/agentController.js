const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/agents/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'agent-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// @desc    Get agent profile
// @route   GET /api/agent/profile
// @access  Private (Agent, Landlord, Property Seller only)
exports.getAgentProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    const allowedRoles = ['Agent', 'Landlord', 'Property Seller'];
    if (!user || !allowedRoles.includes(user.role)) {
        res.status(403);
        throw new Error('Access denied. Agent, Landlord, or Property Seller role required.');
    }

    res.status(200).json({
        success: true,
        data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            whatsappNumber: user.whatsappNumber,
            agentProfile: user.agentProfile || {}
        }
    });
});

// @desc    Get agent profile by user ID (public view for property listings)
// @route   GET /api/agent/profile/:userId
// @access  Public
exports.getAgentProfileById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    const allowedRoles = ['Agent', 'Landlord', 'Property Seller'];
    if (!user || !allowedRoles.includes(user.role)) {
        res.status(404);
        throw new Error('Agent profile not found.');
    }

    res.status(200).json({
        success: true,
        data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            whatsappNumber: user.whatsappNumber,
            agentProfile: user.agentProfile || {},
            role: user.role
        }
    });
});

// @desc    Update agent profile
// @route   PUT /api/agent/profile
// @access  Private (Agent, Landlord, Property Seller only)
exports.updateAgentProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    const allowedRoles = ['Agent', 'Landlord', 'Property Seller'];
    if (!user || !allowedRoles.includes(user.role)) {
        res.status(403);
        throw new Error('Access denied. Agent, Landlord, or Property Seller role required.');
    }

    const {
        bio,
        specializations,
        yearsOfExperience,
        serviceAreas,
        languages,
        certifications,
        achievements,
        companyCertification
    } = req.body;

    // Update agent profile
    user.agentProfile = {
        ...user.agentProfile,
        bio: bio !== undefined ? bio : user.agentProfile?.bio,
        specializations: specializations !== undefined ? specializations : user.agentProfile?.specializations,
        yearsOfExperience: yearsOfExperience !== undefined ? yearsOfExperience : user.agentProfile?.yearsOfExperience,
        serviceAreas: serviceAreas !== undefined ? serviceAreas : user.agentProfile?.serviceAreas,
        languages: languages !== undefined ? languages : user.agentProfile?.languages,
        certifications: certifications !== undefined ? certifications : user.agentProfile?.certifications,
        achievements: achievements !== undefined ? achievements : user.agentProfile?.achievements,
        companyCertification: companyCertification !== undefined ? companyCertification : user.agentProfile?.companyCertification,
        // Preserve existing fields
        profileImage: user.agentProfile?.profileImage,
        rating: user.agentProfile?.rating,
        totalDeals: user.agentProfile?.totalDeals
    };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.agentProfile
    });
});

// @desc    Upload agent profile image
// @route   POST /api/agent/upload-image
// @access  Private (Agent, Landlord, Property Seller only)
exports.uploadProfileImage = [
    upload.single('profileImage'),
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user.id);

        const allowedRoles = ['Agent', 'Landlord', 'Property Seller'];
        if (!user || !allowedRoles.includes(user.role)) {
            res.status(403);
            throw new Error('Access denied. Agent, Landlord, or Property Seller role required.');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image file');
        }

        // Update profile image URL
        const imageUrl = `/uploads/agents/${req.file.filename}`;

        if (!user.agentProfile) {
            user.agentProfile = {};
        }

        user.agentProfile.profileImage = imageUrl;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                profileImage: imageUrl
            }
        });
    })
];

module.exports = exports;
