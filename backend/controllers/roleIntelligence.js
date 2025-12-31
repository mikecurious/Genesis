const roleIntelligenceService = require('../services/roleIntelligenceService');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Analyze user roles and get AI recommendations
// @route   GET /api/role-intelligence/analyze
// @access  Private
exports.analyzeRoles = asyncHandler(async (req, res) => {
    const result = await roleIntelligenceService.analyzeUserRoles(req.user._id);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get current role intelligence data
// @route   GET /api/role-intelligence
// @access  Private
exports.getRoleIntelligence = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('role roleIntelligence manualRoleSet autoRoleAssigned');

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Manually set user role (prevents auto-assignment)
// @route   PUT /api/role-intelligence/set-role
// @access  Private
exports.setRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    const validRoles = ['Property Seller', 'Landlord', 'Agent', 'Surveyor', 'Tenant'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role'
        });
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            role,
            manualRoleSet: true,
            autoRoleAssigned: false
        },
        { new: true }
    ).select('role roleIntelligence manualRoleSet');

    res.status(200).json({
        success: true,
        data: user,
        message: 'Role updated successfully'
    });
});

// @desc    Enable auto role detection
// @route   PUT /api/role-intelligence/enable-auto
// @access  Private
exports.enableAutoDetection = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        manualRoleSet: false
    });

    // Trigger role analysis
    const result = await roleIntelligenceService.analyzeUserRoles(req.user._id);

    const user = await User.findById(req.user._id)
        .select('role roleIntelligence manualRoleSet autoRoleAssigned');

    res.status(200).json({
        success: true,
        data: {
            user,
            analysis: result
        },
        message: 'Auto role detection enabled'
    });
});
