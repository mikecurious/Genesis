const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserUsageStats } = require('../middleware/usageLimits');
const usageTrackingService = require('../services/usageTrackingService');

/**
 * Usage Tracking Routes
 * Provides endpoints for users to check their feature usage and limits
 */

/**
 * Get current user's usage statistics
 * @route   GET /api/usage/stats
 * @access  Private
 */
router.get('/stats', protect, getUserUsageStats);

/**
 * Get detailed usage breakdown for current user
 * @route   GET /api/usage/detailed
 * @access  Private
 */
router.get('/detailed', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const stats = await usageTrackingService.getUsageStats(userId);

        res.json({
            success: true,
            usage: stats,
            upgradeUrl: '/pricing' // Frontend route for pricing page
        });
    } catch (error) {
        console.error('❌ Error getting detailed usage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get usage details',
            message: error.message
        });
    }
});

/**
 * Get plan limits for current user
 * @route   GET /api/usage/limits
 * @access  Private
 */
router.get('/limits', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const planInfo = await usageTrackingService.getPlanLimits(userId);

        res.json({
            success: true,
            plan: planInfo.plan,
            limits: planInfo.limits,
            status: planInfo.status
        });
    } catch (error) {
        console.error('❌ Error getting plan limits:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get plan limits',
            message: error.message
        });
    }
});

/**
 * Check if user can use a specific feature
 * @route   GET /api/usage/can-use/:feature
 * @access  Private
 */
router.get('/can-use/:feature', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { feature } = req.params;

        let canUse;

        switch (feature) {
            case 'ai-search':
                canUse = await usageTrackingService.canUseAISearch(userId);
                break;
            case 'agent-connection':
                canUse = await usageTrackingService.canUseAgentConnection(userId);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid feature',
                    message: 'Feature must be one of: ai-search, agent-connection'
                });
        }

        res.json({
            success: true,
            feature,
            canUse: canUse.allowed,
            ...canUse
        });
    } catch (error) {
        console.error('❌ Error checking feature availability:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check feature availability',
            message: error.message
        });
    }
});

/**
 * Reset usage for current user (admin only - for testing)
 * @route   POST /api/usage/reset
 * @access  Private (should add admin check in production)
 */
router.post('/reset', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // In production, add admin check here:
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ success: false, error: 'Admin access required' });
        // }

        const result = await usageTrackingService.resetUsage(userId);

        res.json({
            success: true,
            message: 'Usage reset successfully',
            ...result
        });
    } catch (error) {
        console.error('❌ Error resetting usage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset usage',
            message: error.message
        });
    }
});

module.exports = router;
