const usageTrackingService = require('../services/usageTrackingService');

/**
 * Usage Limits Middleware
 *
 * Checks if authenticated users can perform specific actions based on their subscription plan limits.
 * Returns 429 (Too Many Requests) if limits are exceeded.
 */

/**
 * Check AI Search limit before processing request
 * - For authenticated users: checks subscription limits
 * - For unauthenticated users: allows public access (can add IP-based limiting if needed)
 */
const checkAISearchLimit = async (req, res, next) => {
    try {
        // If user is not authenticated, allow request (public access)
        // You can add IP-based rate limiting here if needed
        if (!req.user || !req.user._id) {
            return next();
        }

        const userId = req.user._id;

        // Check if user can use AI search
        const canUse = await usageTrackingService.canUseAISearch(userId);

        if (!canUse.allowed) {
            return res.status(429).json({
                success: false,
                error: 'AI search limit reached',
                message: canUse.message,
                limit: {
                    used: canUse.used,
                    limit: canUse.limit,
                    remaining: canUse.remaining
                },
                upgradeRequired: true,
                upgradePath: '/pricing' // Frontend route for pricing page
            });
        }

        // Attach usage info to request for later tracking
        req.usageInfo = {
            canUseAISearch: canUse,
            userId
        };

        next();
    } catch (error) {
        console.error('❌ Error checking AI search limit:', error);
        // On error, allow request to proceed (fail open)
        next();
    }
};

/**
 * Check Agent Connection limit before processing request
 * - For authenticated users: checks subscription limits
 * - For unauthenticated users: allows request (public lead creation)
 */
const checkAgentConnectionLimit = async (req, res, next) => {
    try {
        // If user is not authenticated, allow request (public lead creation)
        if (!req.user || !req.user._id) {
            return next();
        }

        const userId = req.user._id;

        // Check if user can create agent connection
        const canUse = await usageTrackingService.canUseAgentConnection(userId);

        if (!canUse.allowed) {
            return res.status(429).json({
                success: false,
                error: 'Agent connection limit reached',
                message: canUse.message,
                limit: {
                    used: canUse.used,
                    limit: canUse.limit,
                    remaining: canUse.remaining
                },
                upgradeRequired: true,
                upgradePath: '/pricing'
            });
        }

        // Attach usage info to request for later tracking
        req.usageInfo = {
            ...req.usageInfo,
            canUseAgentConnection: canUse,
            userId
        };

        next();
    } catch (error) {
        console.error('❌ Error checking agent connection limit:', error);
        // On error, allow request to proceed (fail open)
        next();
    }
};

/**
 * Track AI search usage after successful request
 * Should be called AFTER the AI search completes successfully
 */
const trackAISearchUsage = async (req, query, success = true) => {
    try {
        if (!req.user || !req.user._id) {
            return; // Don't track for unauthenticated users
        }

        const userId = req.user._id;
        await usageTrackingService.trackAISearch(userId, query, success);
    } catch (error) {
        console.error('❌ Error tracking AI search usage:', error);
        // Don't throw error, just log it
    }
};

/**
 * Track agent connection usage after successful lead creation
 * Should be called AFTER the lead is created successfully
 */
const trackAgentConnectionUsage = async (req, data) => {
    try {
        if (!req.user || !req.user._id) {
            return; // Don't track for unauthenticated users
        }

        const userId = req.user._id;
        await usageTrackingService.trackAgentConnection(userId, data);
    } catch (error) {
        console.error('❌ Error tracking agent connection usage:', error);
        // Don't throw error, just log it
    }
};

/**
 * Get usage stats for current user
 * Useful for displaying remaining quota in UI
 */
const getUserUsageStats = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const userId = req.user._id;
        const stats = await usageTrackingService.getUsageStats(userId);

        res.json({
            success: true,
            usage: stats
        });
    } catch (error) {
        console.error('❌ Error getting usage stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get usage statistics',
            message: error.message
        });
    }
};

module.exports = {
    checkAISearchLimit,
    checkAgentConnectionLimit,
    trackAISearchUsage,
    trackAgentConnectionUsage,
    getUserUsageStats
};
