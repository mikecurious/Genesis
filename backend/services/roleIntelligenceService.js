const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class RoleIntelligenceService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    /**
     * Analyze user activity and detect their primary roles with confidence scores
     */
    async analyzeUserRoles(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Gather user activity data
            const activityData = await this.gatherActivityData(userId);

            // Calculate confidence scores for each role
            const roleScores = await this.calculateRoleScores(user, activityData);

            // Get AI recommendations for role optimization
            const aiRecommendations = await this.getAIRecommendations(user, roleScores, activityData);

            // Detect if user should be hybrid role
            const isHybrid = this.detectHybridRole(roleScores);

            // Update user role insights
            const update = {
                roleIntelligence: {
                    detectedRoles: roleScores,
                    primaryRole: this.determinePrimaryRole(roleScores),
                    isHybrid,
                    confidenceScore: this.calculateOverallConfidence(roleScores),
                    recommendations: aiRecommendations,
                    lastAnalyzed: new Date()
                }
            };

            // Auto-update role if confidence is very high and user hasn't manually set it
            if (!user.manualRoleSet && roleScores[0]?.confidence >= 85) {
                update.role = roleScores[0].role;
                update.autoRoleAssigned = true;
            }

            await User.findByIdAndUpdate(userId, update);

            return {
                success: true,
                roleScores,
                primaryRole: update.roleIntelligence.primaryRole,
                isHybrid,
                recommendations: aiRecommendations,
                autoUpdated: update.role ? true : false
            };

        } catch (error) {
            console.error('Error in role intelligence analysis:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gather user activity data from various sources
     */
    async gatherActivityData(userId) {
        try {
            // Get property ownership data
            const propertiesForSale = await Property.countDocuments({
                createdBy: userId,
                dealType: 'sell'
            });

            const propertiesForRent = await Property.countDocuments({
                createdBy: userId,
                dealType: 'rent'
            });

            const totalProperties = await Property.countDocuments({
                createdBy: userId
            });

            // Get tenant data
            const tenants = await User.countDocuments({
                landlordId: userId,
                role: 'Tenant'
            });

            // Get lead activity
            const leadsCreated = await Lead.countDocuments({
                property: { $in: await Property.find({ createdBy: userId }).select('_id') }
            });

            const leadsConverted = await Lead.countDocuments({
                property: { $in: await Property.find({ createdBy: userId }).select('_id') },
                status: 'converted'
            });

            // Get user profile completeness
            const user = await User.findById(userId);
            const profileCompleteness = this.calculateProfileCompleteness(user);

            return {
                propertiesForSale,
                propertiesForRent,
                totalProperties,
                tenants,
                leadsCreated,
                leadsConverted,
                conversionRate: leadsCreated > 0 ? (leadsConverted / leadsCreated) * 100 : 0,
                profileCompleteness,
                accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)), // days
                isVerified: user.isVerified,
                hasCompletedOnboarding: user.onboardingComplete || false
            };

        } catch (error) {
            console.error('Error gathering activity data:', error);
            return {};
        }
    }

    /**
     * Calculate confidence scores for each possible role
     */
    async calculateRoleScores(user, activityData) {
        const scores = [];

        // Property Seller Score
        const sellerConfidence = this.calculateSellerConfidence(user, activityData);
        if (sellerConfidence > 10) {
            scores.push({
                role: 'Property Seller',
                confidence: sellerConfidence,
                indicators: this.getSellerIndicators(activityData)
            });
        }

        // Landlord Score
        const landlordConfidence = this.calculateLandlordConfidence(user, activityData);
        if (landlordConfidence > 10) {
            scores.push({
                role: 'Landlord',
                confidence: landlordConfidence,
                indicators: this.getLandlordIndicators(activityData)
            });
        }

        // Agent Score
        const agentConfidence = this.calculateAgentConfidence(user, activityData);
        if (agentConfidence > 10) {
            scores.push({
                role: 'Agent',
                confidence: agentConfidence,
                indicators: this.getAgentIndicators(activityData)
            });
        }

        // Surveyor Score
        const surveyorConfidence = this.calculateSurveyorConfidence(user);
        if (surveyorConfidence > 10) {
            scores.push({
                role: 'Surveyor',
                confidence: surveyorConfidence,
                indicators: []
            });
        }

        // Sort by confidence score (highest first)
        scores.sort((a, b) => b.confidence - a.confidence);

        return scores;
    }

    /**
     * Calculate Property Seller confidence
     */
    calculateSellerConfidence(user, data) {
        let confidence = 0;

        // Base score from current role
        if (user.role === 'Property Seller') confidence += 30;

        // Property listings for sale
        if (data.propertiesForSale > 0) confidence += Math.min(40, data.propertiesForSale * 10);

        // Lead generation
        if (data.leadsCreated > 5) confidence += 15;

        // Conversion rate
        if (data.conversionRate > 20) confidence += 15;

        // Profile completeness
        confidence += data.profileCompleteness * 0.2;

        return Math.min(100, Math.round(confidence));
    }

    /**
     * Calculate Landlord confidence
     */
    calculateLandlordConfidence(user, data) {
        let confidence = 0;

        // Base score from current role
        if (user.role === 'Landlord') confidence += 30;

        // Rental properties
        if (data.propertiesForRent > 0) confidence += Math.min(40, data.propertiesForRent * 10);

        // Active tenants
        if (data.tenants > 0) confidence += Math.min(30, data.tenants * 8);

        // Long-term activity
        if (data.accountAge > 30) confidence += 10;

        // Profile completeness
        confidence += data.profileCompleteness * 0.2;

        return Math.min(100, Math.round(confidence));
    }

    /**
     * Calculate Agent confidence
     */
    calculateAgentConfidence(user, data) {
        let confidence = 0;

        // Base score from current role
        if (user.role === 'Agent') confidence += 30;

        // High property count (agents list many properties)
        if (data.totalProperties >= 5) confidence += 25;
        else if (data.totalProperties >= 10) confidence += 35;

        // Mixed property types (selling & renting)
        if (data.propertiesForSale > 0 && data.propertiesForRent > 0) confidence += 20;

        // High lead generation
        if (data.leadsCreated > 10) confidence += 15;

        // Verification status
        if (data.isVerified) confidence += 10;

        return Math.min(100, Math.round(confidence));
    }

    /**
     * Calculate Surveyor confidence
     */
    calculateSurveyorConfidence(user) {
        let confidence = 0;

        if (user.role === 'Surveyor') confidence += 80;
        if (user.surveyorCertifications && user.surveyorCertifications.length > 0) confidence += 20;

        return Math.min(100, Math.round(confidence));
    }

    /**
     * Get detailed indicators for each role
     */
    getSellerIndicators(data) {
        const indicators = [];
        if (data.propertiesForSale > 0) indicators.push(`${data.propertiesForSale} properties listed for sale`);
        if (data.leadsCreated > 0) indicators.push(`${data.leadsCreated} sales leads generated`);
        if (data.conversionRate > 0) indicators.push(`${data.conversionRate.toFixed(1)}% conversion rate`);
        return indicators;
    }

    getLandlordIndicators(data) {
        const indicators = [];
        if (data.propertiesForRent > 0) indicators.push(`${data.propertiesForRent} rental properties`);
        if (data.tenants > 0) indicators.push(`${data.tenants} active tenants`);
        return indicators;
    }

    getAgentIndicators(data) {
        const indicators = [];
        if (data.totalProperties > 0) indicators.push(`${data.totalProperties} total listings`);
        if (data.leadsCreated > 0) indicators.push(`${data.leadsCreated} leads managed`);
        return indicators;
    }

    /**
     * Calculate profile completeness percentage
     */
    calculateProfileCompleteness(user) {
        let score = 0;
        const fields = [
            'name', 'email', 'phone', 'location', 'bio',
            'profileImage', 'whatsappNumber'
        ];

        fields.forEach(field => {
            if (user[field]) score += 100 / fields.length;
        });

        return Math.round(score);
    }

    /**
     * Detect if user should have hybrid role
     */
    detectHybridRole(roleScores) {
        if (roleScores.length < 2) return false;

        // If top 2 roles both have confidence >= 60, consider hybrid
        if (roleScores[0].confidence >= 60 && roleScores[1].confidence >= 60) {
            return true;
        }

        return false;
    }

    /**
     * Determine primary role from scores
     */
    determinePrimaryRole(roleScores) {
        if (roleScores.length === 0) return null;
        return roleScores[0].role;
    }

    /**
     * Calculate overall confidence in role detection
     */
    calculateOverallConfidence(roleScores) {
        if (roleScores.length === 0) return 0;
        return roleScores[0].confidence;
    }

    /**
     * Get AI-powered recommendations for role optimization
     */
    async getAIRecommendations(user, roleScores, activityData) {
        try {
            const prompt = `
You are an AI assistant helping users optimize their real estate platform experience based on their activity patterns.

User's Current Role: ${user.role}
Detected Roles and Confidence:
${roleScores.map(r => `- ${r.role}: ${r.confidence}% confidence`).join('\n')}

Activity Data:
- Total Properties: ${activityData.totalProperties}
- For Sale: ${activityData.propertiesForSale}
- For Rent: ${activityData.propertiesForRent}
- Tenants: ${activityData.tenants}
- Leads Generated: ${activityData.leadsCreated}
- Account Age: ${activityData.accountAge} days
- Profile Completeness: ${activityData.profileCompleteness}%

Provide 2-3 actionable recommendations to help this user maximize their success on the platform.

Return ONLY a JSON array of strings:
["recommendation 1", "recommendation 2", "recommendation 3"]
`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Parse JSON response
            const jsonMatch = response.match(/\[[\s\S]*?\]/);
            if (!jsonMatch) {
                return this.getDefaultRecommendations(roleScores, activityData);
            }

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error('Error getting AI recommendations:', error);
            return this.getDefaultRecommendations(roleScores, activityData);
        }
    }

    /**
     * Get default recommendations if AI fails
     */
    getDefaultRecommendations(roleScores, activityData) {
        const recommendations = [];

        if (activityData.profileCompleteness < 80) {
            recommendations.push('Complete your profile to increase visibility and trust with potential clients');
        }

        if (activityData.totalProperties === 0) {
            recommendations.push('List your first property to start generating leads and building your portfolio');
        }

        if (!activityData.isVerified) {
            recommendations.push('Verify your account to unlock premium features and build credibility');
        }

        if (roleScores.length > 1 && roleScores[1].confidence >= 50) {
            recommendations.push(`Consider leveraging ${roleScores[1].role} features to diversify your income streams`);
        }

        return recommendations.slice(0, 3);
    }
}

module.exports = new RoleIntelligenceService();
