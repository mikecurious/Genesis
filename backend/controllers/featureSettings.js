const featureSettingsService = require('../services/featureSettingsService');
const asyncHandler = require('express-async-handler');

// @desc    Get user's feature settings
// @route   GET /api/feature-settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res) => {
    const result = await featureSettingsService.getUserSettings(req.user._id);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.status(200).json({
        success: true,
        data: result.data
    });
});

// @desc    Update feature settings
// @route   PUT /api/feature-settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res) => {
    const result = await featureSettingsService.updateSettings(req.user._id, req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
        message: result.message
    });
});

// @desc    Reset settings to default
// @route   POST /api/feature-settings/reset
// @access  Private
exports.resetSettings = asyncHandler(async (req, res) => {
    const result = await featureSettingsService.resetToDefault(req.user._id);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
        message: result.message
    });
});

// @desc    Get feature recommendations
// @route   GET /api/feature-settings/recommendations
// @access  Private
exports.getRecommendations = asyncHandler(async (req, res) => {
    const result = await featureSettingsService.getRecommendations(req.user._id);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.status(200).json({
        success: true,
        data: result.data
    });
});

// @desc    Toggle specific feature on/off (quick action)
// @route   PATCH /api/feature-settings/:feature/toggle
// @access  Private
exports.toggleFeature = asyncHandler(async (req, res) => {
    const { feature } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Please provide enabled status'
        });
    }

    const validFeatures = ['aiManager', 'rentReminders', 'leadScoring', 'maintenanceAI', 'financialReports', 'aiVoice'];

    if (!validFeatures.includes(feature)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid feature'
        });
    }

    const updates = {
        [feature]: { enabled }
    };

    const result = await featureSettingsService.updateSettings(req.user._id, updates);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
        message: `${feature} ${enabled ? 'enabled' : 'disabled'} successfully`
    });
});
