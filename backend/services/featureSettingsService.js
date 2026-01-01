const User = require('../models/User');

class FeatureSettingsService {
    /**
     * Get all feature settings for a user
     */
    async getUserSettings(userId) {
        try {
            const user = await User.findById(userId).select('featureFlags subscription');

            if (!user) {
                throw new Error('User not found');
            }

            // Check which features are premium and require subscription
            const premiumFeatures = {
                aiVoice: true,
                maintenanceAI: {
                    imageAnalysis: true // Image analysis is premium
                }
            };

            // Check if user has active subscription
            const hasActiveSubscription = user.subscription?.status === 'active';

            // Return settings with availability status
            const settings = {
                available: {
                    aiManager: true,
                    rentReminders: true,
                    leadScoring: true,
                    maintenanceAI: {
                        enabled: true,
                        autoAnalysis: true,
                        imageAnalysis: hasActiveSubscription
                    },
                    financialReports: true,
                    aiVoice: hasActiveSubscription
                },
                current: user.featureFlags,
                subscription: {
                    active: hasActiveSubscription,
                    plan: user.subscription?.plan || null,
                    expiresAt: user.subscription?.expiresAt || null
                }
            };

            return {
                success: true,
                data: settings
            };

        } catch (error) {
            console.error('Error getting user settings:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update feature settings
     */
    async updateSettings(userId, updates) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new Error('User not found');
            }

            // Check subscription for premium features
            const hasActiveSubscription = user.subscription?.status === 'active';

            // Validate premium feature access
            if (updates.aiVoice?.enabled && !hasActiveSubscription) {
                throw new Error('AI Voice requires an active subscription');
            }

            if (updates.maintenanceAI?.imageAnalysis && !hasActiveSubscription) {
                throw new Error('Image Analysis requires an active subscription');
            }

            // Build update object
            const updateObj = {};

            // Handle AI Manager settings
            if (updates.aiManager) {
                if (updates.aiManager.enabled !== undefined) {
                    updateObj['featureFlags.aiManager.enabled'] = updates.aiManager.enabled;
                }
                if (updates.aiManager.automationLevel) {
                    const validLevels = ['off', 'low', 'medium', 'high'];
                    if (!validLevels.includes(updates.aiManager.automationLevel)) {
                        throw new Error('Invalid automation level');
                    }
                    updateObj['featureFlags.aiManager.automationLevel'] = updates.aiManager.automationLevel;
                }
            }

            // Handle Rent Reminders settings
            if (updates.rentReminders) {
                if (updates.rentReminders.enabled !== undefined) {
                    updateObj['featureFlags.rentReminders.enabled'] = updates.rentReminders.enabled;
                }
                if (updates.rentReminders.daysBeforeDue) {
                    updateObj['featureFlags.rentReminders.daysBeforeDue'] = updates.rentReminders.daysBeforeDue;
                }
                if (updates.rentReminders.channels) {
                    if (updates.rentReminders.channels.email !== undefined) {
                        updateObj['featureFlags.rentReminders.channels.email'] = updates.rentReminders.channels.email;
                    }
                    if (updates.rentReminders.channels.whatsapp !== undefined) {
                        updateObj['featureFlags.rentReminders.channels.whatsapp'] = updates.rentReminders.channels.whatsapp;
                    }
                    if (updates.rentReminders.channels.push !== undefined) {
                        updateObj['featureFlags.rentReminders.channels.push'] = updates.rentReminders.channels.push;
                    }
                }
            }

            // Handle Lead Scoring settings
            if (updates.leadScoring) {
                if (updates.leadScoring.enabled !== undefined) {
                    updateObj['featureFlags.leadScoring.enabled'] = updates.leadScoring.enabled;
                }
                if (updates.leadScoring.autoFollowUp !== undefined) {
                    updateObj['featureFlags.leadScoring.autoFollowUp'] = updates.leadScoring.autoFollowUp;
                }
                if (updates.leadScoring.followUpInterval !== undefined) {
                    updateObj['featureFlags.leadScoring.followUpInterval'] = updates.leadScoring.followUpInterval;
                }
            }

            // Handle Maintenance AI settings
            if (updates.maintenanceAI) {
                if (updates.maintenanceAI.enabled !== undefined) {
                    updateObj['featureFlags.maintenanceAI.enabled'] = updates.maintenanceAI.enabled;
                }
                if (updates.maintenanceAI.autoAnalysis !== undefined) {
                    updateObj['featureFlags.maintenanceAI.autoAnalysis'] = updates.maintenanceAI.autoAnalysis;
                }
                if (updates.maintenanceAI.imageAnalysis !== undefined) {
                    updateObj['featureFlags.maintenanceAI.imageAnalysis'] = updates.maintenanceAI.imageAnalysis;
                }
            }

            // Handle Financial Reports settings
            if (updates.financialReports) {
                if (updates.financialReports.enabled !== undefined) {
                    updateObj['featureFlags.financialReports.enabled'] = updates.financialReports.enabled;
                }
                if (updates.financialReports.autoGenerate !== undefined) {
                    updateObj['featureFlags.financialReports.autoGenerate'] = updates.financialReports.autoGenerate;
                }
                if (updates.financialReports.frequency) {
                    const validFrequencies = ['weekly', 'monthly', 'quarterly'];
                    if (!validFrequencies.includes(updates.financialReports.frequency)) {
                        throw new Error('Invalid report frequency');
                    }
                    updateObj['featureFlags.financialReports.frequency'] = updates.financialReports.frequency;
                }
            }

            // Handle AI Voice settings
            if (updates.aiVoice) {
                if (updates.aiVoice.enabled !== undefined) {
                    updateObj['featureFlags.aiVoice.enabled'] = updates.aiVoice.enabled;
                }
            }

            // Apply updates
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateObj },
                { new: true, runValidators: true }
            ).select('featureFlags');

            return {
                success: true,
                data: updatedUser.featureFlags,
                message: 'Settings updated successfully'
            };

        } catch (error) {
            console.error('Error updating settings:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reset settings to default
     */
    async resetToDefault(userId) {
        try {
            const defaultSettings = {
                'featureFlags.aiManager.enabled': false,
                'featureFlags.aiManager.automationLevel': 'medium',
                'featureFlags.rentReminders.enabled': true,
                'featureFlags.rentReminders.daysBeforeDue': [7, 3, 1],
                'featureFlags.rentReminders.channels.email': true,
                'featureFlags.rentReminders.channels.whatsapp': false,
                'featureFlags.rentReminders.channels.push': true,
                'featureFlags.leadScoring.enabled': true,
                'featureFlags.leadScoring.autoFollowUp': true,
                'featureFlags.leadScoring.followUpInterval': 2,
                'featureFlags.maintenanceAI.enabled': false,
                'featureFlags.maintenanceAI.autoAnalysis': false,
                'featureFlags.maintenanceAI.imageAnalysis': false,
                'featureFlags.financialReports.enabled': true,
                'featureFlags.financialReports.autoGenerate': false,
                'featureFlags.financialReports.frequency': 'monthly',
                'featureFlags.aiVoice.enabled': false
            };

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: defaultSettings },
                { new: true }
            ).select('featureFlags');

            return {
                success: true,
                data: updatedUser.featureFlags,
                message: 'Settings reset to default'
            };

        } catch (error) {
            console.error('Error resetting settings:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get feature recommendations based on user role and activity
     */
    async getRecommendations(userId) {
        try {
            const user = await User.findById(userId).select('role featureFlags roleIntelligence');

            const recommendations = [];

            // Recommend AI Manager for landlords with tenants
            if ((user.role === 'Landlord' || user.roleIntelligence?.detectedRoles?.some(r => r.role === 'Landlord')) &&
                !user.featureFlags.aiManager.enabled) {
                recommendations.push({
                    feature: 'aiManager',
                    reason: 'Automate tenant communication and rent reminders',
                    impact: 'Save 10+ hours per month on tenant management',
                    action: 'Enable AI Manager'
                });
            }

            // Recommend Lead Scoring for active sellers/agents
            if ((user.role === 'Property Seller' || user.role === 'Agent' ||
                 user.roleIntelligence?.detectedRoles?.some(r => r.role === 'Property Seller' || r.role === 'Agent')) &&
                !user.featureFlags.leadScoring.enabled) {
                recommendations.push({
                    feature: 'leadScoring',
                    reason: 'Prioritize high-value leads and increase conversions',
                    impact: 'Improve conversion rate by 30-50%',
                    action: 'Enable Lead Scoring'
                });
            }

            // Recommend Maintenance AI for landlords with properties
            if ((user.role === 'Landlord' || user.roleIntelligence?.detectedRoles?.some(r => r.role === 'Landlord')) &&
                !user.featureFlags.maintenanceAI.enabled) {
                recommendations.push({
                    feature: 'maintenanceAI',
                    reason: 'Get instant cost estimates and technician recommendations',
                    impact: 'Reduce maintenance response time by 70%',
                    action: 'Enable Maintenance AI'
                });
            }

            // Recommend Financial Reports
            if (!user.featureFlags.financialReports.enabled) {
                recommendations.push({
                    feature: 'financialReports',
                    reason: 'Track income, expenses, and profitability automatically',
                    impact: 'Make data-driven decisions with AI insights',
                    action: 'Enable Financial Reports'
                });
            }

            return {
                success: true,
                data: recommendations
            };

        } catch (error) {
            console.error('Error getting recommendations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new FeatureSettingsService();
