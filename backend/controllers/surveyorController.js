const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/surveyors/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'surveyor-' + uniqueSuffix + path.extname(file.originalname));
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

// @desc    Get surveyor profile
// @route   GET /api/surveyor/profile
// @access  Private (Surveyor only)
exports.getSurveyorProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'Surveyor') {
        res.status(403);
        throw new Error('Access denied. Surveyor role required.');
    }

    res.status(200).json({
        success: true,
        data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            surveyorProfile: user.surveyorProfile || {}
        }
    });
});

// @desc    Update surveyor profile
// @route   PUT /api/surveyor/profile
// @access  Private (Surveyor only)
exports.updateSurveyorProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'Surveyor') {
        res.status(403);
        throw new Error('Access denied. Surveyor role required.');
    }

    const {
        bio,
        specializations,
        services,
        yearsOfExperience,
        certifications,
        availability,
        location
    } = req.body;

    // Update surveyor profile
    user.surveyorProfile = {
        ...user.surveyorProfile,
        bio: bio || user.surveyorProfile?.bio,
        specializations: specializations || user.surveyorProfile?.specializations,
        services: services || user.surveyorProfile?.services,
        yearsOfExperience: yearsOfExperience !== undefined ? yearsOfExperience : user.surveyorProfile?.yearsOfExperience,
        certifications: certifications || user.surveyorProfile?.certifications,
        availability: availability || user.surveyorProfile?.availability,
        location: location || user.surveyorProfile?.location,
        // Preserve existing fields
        profileImage: user.surveyorProfile?.profileImage,
        rating: user.surveyorProfile?.rating,
        completedSurveys: user.surveyorProfile?.completedSurveys
    };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.surveyorProfile
    });
});

// @desc    Upload surveyor profile image
// @route   POST /api/surveyor/upload-image
// @access  Private (Surveyor only)
exports.uploadProfileImage = [
    upload.single('profileImage'),
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'Surveyor') {
            res.status(403);
            throw new Error('Access denied. Surveyor role required.');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image file');
        }

        // Update profile image URL
        const imageUrl = `/uploads/surveyors/${req.file.filename}`;

        if (!user.surveyorProfile) {
            user.surveyorProfile = {};
        }

        user.surveyorProfile.profileImage = imageUrl;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                profileImage: imageUrl
            }
        });
    })
];

// @desc    Get all available surveyors
// @route   GET /api/surveyor/available
// @access  Public
exports.getAvailableSurveyors = asyncHandler(async (req, res) => {
    const { specialization, location } = req.query;

    const query = {
        role: 'Surveyor',
        'surveyorProfile.availability': 'Available'
    };

    if (specialization) {
        query['surveyorProfile.specializations'] = specialization;
    }

    if (location) {
        query['surveyorProfile.location'] = new RegExp(location, 'i');
    }

    const surveyors = await User.find(query)
        .select('name email phone whatsappNumber surveyorProfile')
        .sort({ 'surveyorProfile.rating': -1, 'surveyorProfile.completedSurveys': -1 });

    res.status(200).json({
        success: true,
        count: surveyors.length,
        data: surveyors
    });
});

// @desc    Search surveyors (with AI context)
// @route   POST /api/surveyor/search
// @access  Public
exports.searchSurveyors = asyncHandler(async (req, res) => {
    const { propertyType, location, requirements } = req.body;

    // Build query based on property type and requirements
    const query = {
        role: 'Surveyor',
        'surveyorProfile.availability': 'Available'
    };

    // Map property types to surveyor specializations
    const specializationMap = {
        'apartment': 'Residential',
        'house': 'Residential',
        'condo': 'Residential',
        'villa': 'Residential',
        'office': 'Commercial',
        'retail': 'Commercial',
        'warehouse': 'Industrial',
        'land': 'Land',
        'farm': 'Agricultural'
    };

    if (propertyType && specializationMap[propertyType.toLowerCase()]) {
        query['surveyorProfile.specializations'] = specializationMap[propertyType.toLowerCase()];
    }

    if (location) {
        query['surveyorProfile.location'] = new RegExp(location, 'i');
    }

    const surveyors = await User.find(query)
        .select('name email phone whatsappNumber surveyorProfile')
        .sort({ 'surveyorProfile.rating': -1, 'surveyorProfile.completedSurveys': -1 })
        .limit(10);

    res.status(200).json({
        success: true,
        count: surveyors.length,
        data: surveyors,
        context: {
            propertyType,
            location,
            matchedSpecialization: specializationMap[propertyType?.toLowerCase()]
        }
    });
});

module.exports = exports;
