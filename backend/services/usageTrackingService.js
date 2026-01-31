const UsageTracking = require('../models/UsageTracking');
const User = require('../models/User');

/**
 * Usage Tracking Service
 *
 * Manages feature usage limits based on subscription plans.
 * Enforces limits for free and paid tiers.
 */

// Plan limits configuration
const PLAN_LIMITS = {
    'Free': {
        aiSearches: 2,
        agentConnections: 2,
        leadScoring: 0,
        maintenanceAnalyses: 0,
        financialReports: 0,
        aiVoiceInteractions: 0
    },
    'None': {
        aiSearches: 2,
        agentConnections: 2,
        leadScoring: 0,
        maintenanceAnalyses: 0,
        financialReports: 0,
        aiVoiceInteractions: 0
    },
    'Basic': {
        aiSearches: 50,
        agentConnections: 20,
        leadScoring: 100,
        maintenanceAnalyses: 10,
        financialReports: 5,
        aiVoiceInteractions: 0
    },
    'MyGF 1.3': {
        aiSearches: 200,
        agentConnections: 100,
        leadScoring: 500,
        maintenanceAnalyses: 50,
        financialReports: 20,
        aiVoiceInteractions: 50
    },
    'MyGF 3.2': {
        aiSearches: -1, // Unlimited
        agentConnections: -1, // Unlimited
        leadScoring: -1, // Unlimited
        maintenanceAnalyses: -1, // Unlimited
        financialReports: -1, // Unlimited
        aiVoiceInteractions: -1 // Unlimited
    }
};

class UsageTrackingService {
    /**
     * Get plan limits for a user
     */
    async getPlanLimits(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const plan = user.subscription?.plan || 'Free';
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['Free'];

        return {
            plan,
            limits,
            status: user.subscription?.status || 'inactive'
        };
    }

    /**
     * Get current usage for a user
     */
    async getUserUsage(userId) {
        const usage = await UsageTracking.findOrCreateForUser(userId);
        const planInfo = await this.getPlanLimits(userId);

        return {
            period: usage.period,
            plan: planInfo.plan,
            limits: planInfo.limits,
            current: {
                aiSearches: usage.aiSearches.count,
                agentConnections: usage.agentConnections.count,
                leadScoring: usage.otherFeatures.leadScoring,
                maintenanceAnalyses: usage.otherFeatures.maintenanceAnalyses,
                financialReports: usage.otherFeatures.financialReports,
                aiVoiceInteractions: usage.otherFeatures.aiVoiceInteractions
            },
            remaining: this.calculateRemaining(usage, planInfo.limits),
            lastActivity: {
                aiSearch: usage.aiSearches.lastUsed,
                agentConnection: usage.agentConnections.lastUsed
            }
        };
    }

    /**
     * Calculate remaining quota for each feature
     */
    calculateRemaining(usage, limits) {
        const calculateSingle = (used, limit) => {
            if (limit === -1) return -1; // Unlimited
            return Math.max(0, limit - used);
        };

        return {
            aiSearches: calculateSingle(usage.aiSearches.count, limits.aiSearches),
            agentConnections: calculateSingle(usage.agentConnections.count, limits.agentConnections),
            leadScoring: calculateSingle(usage.otherFeatures.leadScoring, limits.leadScoring),
            maintenanceAnalyses: calculateSingle(usage.otherFeatures.maintenanceAnalyses, limits.maintenanceAnalyses),
            financialReports: calculateSingle(usage.otherFeatures.financialReports, limits.financialReports),
            aiVoiceInteractions: calculateSingle(usage.otherFeatures.aiVoiceInteractions, limits.aiVoiceInteractions)
        };
    }

    /**
     * Check if user can perform AI search
     */
    async canUseAISearch(userId) {
        const usage = await UsageTracking.findOrCreateForUser(userId);
        const planInfo = await this.getPlanLimits(userId);

        const limit = planInfo.limits.aiSearches;

        // Unlimited
        if (limit === -1) {
            return {
                allowed: true,
                remaining: -1,
                limit: -1,
                used: usage.aiSearches.count
            };
        }

        const allowed = usage.aiSearches.count < limit;
        const remaining = Math.max(0, limit - usage.aiSearches.count);

        return {
            allowed,
            remaining,
            limit,
            used: usage.aiSearches.count,
            message: allowed
                ? `You have ${remaining} AI search${remaining !== 1 ? 'es' : ''} remaining this month.`
                : `You've reached your AI search limit of ${limit} for this month. Upgrade your plan for more searches.`
        };
    }

    /**
     * Check if user can create agent connection
     */
    async canUseAgentConnection(userId) {
        const usage = await UsageTracking.findOrCreateForUser(userId);
        const planInfo = await this.getPlanLimits(userId);

        const limit = planInfo.limits.agentConnections;

        // Unlimited
        if (limit === -1) {
            return {
                allowed: true,
                remaining: -1,
                limit: -1,
                used: usage.agentConnections.count
            };
        }

        const allowed = usage.agentConnections.count < limit;
        const remaining = Math.max(0, limit - usage.agentConnections.count);

        return {
            allowed,
            remaining,
            limit,
            used: usage.agentConnections.count,
            message: allowed
                ? `You have ${remaining} agent connection${remaining !== 1 ? 's' : ''} remaining this month.`
                : `You've reached your agent connection limit of ${limit} for this month. Upgrade your plan for more connections.`
        };
    }

    /**
     * Track AI search usage
     */
    async trackAISearch(userId, query, success = true) {
        try {
            const usage = await UsageTracking.findOrCreateForUser(userId);
            await usage.incrementAISearch(query, success);

            console.log(`✅ AI Search tracked for user ${userId}. Total: ${usage.aiSearches.count}`);

            return {
                success: true,
                count: usage.aiSearches.count
            };
        } catch (error) {
            console.error('❌ Error tracking AI search:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Track agent connection usage
     */
    async trackAgentConnection(userId, data) {
        try {
            const usage = await UsageTracking.findOrCreateForUser(userId);
            await usage.incrementAgentConnection(data);

            console.log(`✅ Agent connection tracked for user ${userId}. Total: ${usage.agentConnections.count}`);

            return {
                success: true,
                count: usage.agentConnections.count
            };
        } catch (error) {
            console.error('❌ Error tracking agent connection:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get usage statistics with plan info
     */
    async getUsageStats(userId) {
        const usage = await this.getUserUsage(userId);
        const planInfo = await this.getPlanLimits(userId);

        // Calculate percentage used for each feature
        const calculatePercentage = (used, limit) => {
            if (limit === -1) return 0; // Unlimited
            if (limit === 0) return 100;
            return Math.min(100, Math.round((used / limit) * 100));
        };

        return {
            ...usage,
            percentageUsed: {
                aiSearches: calculatePercentage(usage.current.aiSearches, usage.limits.aiSearches),
                agentConnections: calculatePercentage(usage.current.agentConnections, usage.limits.agentConnections)
            },
            warnings: this.generateWarnings(usage),
            recommendations: this.generateRecommendations(usage, planInfo)
        };
    }

    /**
     * Generate warnings when approaching limits
     */
    generateWarnings(usage) {
        const warnings = [];

        // Check AI searches
        if (usage.limits.aiSearches !== -1) {
            const aiSearchPercentage = (usage.current.aiSearches / usage.limits.aiSearches) * 100;
            if (aiSearchPercentage >= 80 && aiSearchPercentage < 100) {
                warnings.push({
                    type: 'warning',
                    feature: 'aiSearches',
                    message: `You've used ${usage.current.aiSearches} of ${usage.limits.aiSearches} AI searches. Consider upgrading your plan.`
                });
            } else if (aiSearchPercentage >= 100) {
                warnings.push({
                    type: 'critical',
                    feature: 'aiSearches',
                    message: 'AI search limit reached. Upgrade to continue using AI search.'
                });
            }
        }

        // Check agent connections
        if (usage.limits.agentConnections !== -1) {
            const connectionPercentage = (usage.current.agentConnections / usage.limits.agentConnections) * 100;
            if (connectionPercentage >= 80 && connectionPercentage < 100) {
                warnings.push({
                    type: 'warning',
                    feature: 'agentConnections',
                    message: `You've used ${usage.current.agentConnections} of ${usage.limits.agentConnections} agent connections. Consider upgrading your plan.`
                });
            } else if (connectionPercentage >= 100) {
                warnings.push({
                    type: 'critical',
                    feature: 'agentConnections',
                    message: 'Agent connection limit reached. Upgrade to continue contacting agents.'
                });
            }
        }

        return warnings;
    }

    /**
     * Generate upgrade recommendations
     */
    generateRecommendations(usage, planInfo) {
        const recommendations = [];

        // If on free plan and using features
        if (planInfo.plan === 'Free' || planInfo.plan === 'None') {
            if (usage.current.aiSearches >= 1 || usage.current.agentConnections >= 1) {
                recommendations.push({
                    type: 'upgrade',
                    message: 'Upgrade to Basic plan for 50 AI searches and 20 agent connections per month.',
                    targetPlan: 'Basic',
                    benefits: ['50 AI searches/month', '20 agent connections/month', '100 lead scoring operations', '5 financial reports']
                });
            }
        }

        // If on basic plan and approaching limits
        if (planInfo.plan === 'Basic') {
            const aiSearchPercentage = (usage.current.aiSearches / usage.limits.aiSearches) * 100;
            const connectionPercentage = (usage.current.agentConnections / usage.limits.agentConnections) * 100;

            if (aiSearchPercentage >= 70 || connectionPercentage >= 70) {
                recommendations.push({
                    type: 'upgrade',
                    message: 'Upgrade to MyGF 1.3 for 200 AI searches and 100 agent connections per month.',
                    targetPlan: 'MyGF 1.3',
                    benefits: ['200 AI searches/month', '100 agent connections/month', '500 lead scoring operations', '50 AI voice interactions']
                });
            }
        }

        return recommendations;
    }

    /**
     * Reset usage for testing (admin only)
     */
    async resetUsage(userId) {
        const period = UsageTracking.getCurrentPeriod();
        await UsageTracking.deleteOne({ userId, period });

        console.log(`✅ Usage reset for user ${userId} in period ${period}`);

        return {
            success: true,
            message: 'Usage counters reset successfully'
        };
    }
}

module.exports = new UsageTrackingService();
