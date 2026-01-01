const User = require('../models/User');
const Property = require('../models/Property');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const groqService = require('./groqService');

class SurveyorMatchingService {
    constructor() {
        // Initialize Gemini if available
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    /**
     * Call AI with fallback (Gemini -> Groq)
     */
    async callAI(prompt, returnJSON = true) {
        // Try Gemini first
        if (this.model) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response.text();

                if (returnJSON) {
                    const jsonMatch = response.match(/\{[\s\S]*\}/);
                    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
                }
                return response;
            } catch (error) {
                console.warn('Gemini AI failed, falling back to Groq:', error.message);
            }
        }

        // Fallback to Groq
        try {
            const response = await groqService.chat([
                {
                    role: 'user',
                    content: prompt
                }
            ], {
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 500
            });

            if (returnJSON) {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            }
            return response;
        } catch (error) {
            console.error('Both Gemini and Groq failed:', error);
            return null;
        }
    }

    /**
     * Parse natural language chat to detect surveyor request intent
     */
    async parseSurveyorIntent(message, userId) {
        try {
            const prompt = `
You are an AI assistant helping to detect surveyor requests from natural language messages.

User Message: "${message}"

Analyze if this message is requesting a surveyor and extract the following information:

Return ONLY a JSON object with this structure:
{
    "isSurveyorRequest": true/false,
    "confidence": 0-100,
    "surveyType": "inspection" | "valuation" | "compliance" | "general" | null,
    "propertyMentioned": true/false,
    "propertyContext": "any property details mentioned",
    "urgency": "low" | "medium" | "high",
    "extractedDetails": {
        "location": "if mentioned",
        "propertyType": "if mentioned (Residential/Commercial/Land/etc.)",
        "specificNeeds": "any specific requirements mentioned"
    }
}

Examples:
- "I need a surveyor for this property" -> {"isSurveyorRequest": true, "confidence": 95, "surveyType": "general", ...}
- "Find a valuer for my apartment" -> {"isSurveyorRequest": true, "confidence": 98, "surveyType": "valuation", "extractedDetails": {"propertyType": "Residential"}, ...}
- "Can someone inspect my building?" -> {"isSurveyorRequest": true, "confidence": 90, "surveyType": "inspection", ...}
- "What's the price?" -> {"isSurveyorRequest": false, "confidence": 10, ...}
`;

            const intent = await this.callAI(prompt, true);

            if (!intent) {
                return {
                    isSurveyorRequest: false,
                    confidence: 0
                };
            }

            return intent;

        } catch (error) {
            console.error('Error parsing surveyor intent:', error);
            return {
                isSurveyorRequest: false,
                confidence: 0
            };
        }
    }

    /**
     * Find best matching surveyors based on requirements
     */
    async findMatchingSurveyors(criteria, limit = 5) {
        try {
            const query = {
                role: 'Surveyor',
                accountStatus: 'active',
                isVerified: true
            };

            // Filter by specialization if provided
            if (criteria.propertyType) {
                const specializationMap = {
                    'Residential': 'Residential',
                    'Commercial': 'Commercial',
                    'Land': 'Land',
                    'Industrial': 'Industrial',
                    'Agricultural': 'Agricultural'
                };
                const specialization = specializationMap[criteria.propertyType];
                if (specialization) {
                    query['surveyorProfile.specializations'] = specialization;
                }
            }

            // Filter by location if provided
            if (criteria.location) {
                query.location = new RegExp(criteria.location, 'i');
            }

            // Find surveyors
            const surveyors = await User.find(query)
                .select('name email phone location surveyorProfile')
                .limit(limit);

            // Score and rank surveyors
            const rankedSurveyors = await this.rankSurveyors(surveyors, criteria);

            return rankedSurveyors;

        } catch (error) {
            console.error('Error finding matching surveyors:', error);
            return [];
        }
    }

    /**
     * Rank surveyors based on criteria
     */
    async rankSurveyors(surveyors, criteria) {
        const scored = surveyors.map(surveyor => {
            let score = 0;

            // Base score for verified surveyors
            score += 20;

            // Score for specialization match
            if (criteria.propertyType && surveyor.surveyorProfile?.specializations) {
                const specializationMap = {
                    'Residential': 'Residential',
                    'Commercial': 'Commercial',
                    'Land': 'Land'
                };
                if (surveyor.surveyorProfile.specializations.includes(specializationMap[criteria.propertyType])) {
                    score += 30;
                }
            }

            // Score for location proximity (simple string match for now)
            if (criteria.location && surveyor.location) {
                if (surveyor.location.toLowerCase().includes(criteria.location.toLowerCase()) ||
                    criteria.location.toLowerCase().includes(surveyor.location.toLowerCase())) {
                    score += 25;
                }
            }

            // Score for experience (years * 5, max 25)
            if (surveyor.surveyorProfile?.experience) {
                score += Math.min(25, surveyor.surveyorProfile.experience * 5);
            }

            // Score for rating (if available)
            if (surveyor.surveyorProfile?.rating) {
                score += surveyor.surveyorProfile.rating * 4; // max 20 for 5-star rating
            }

            // Score for number of certifications
            if (surveyor.surveyorProfile?.certifications) {
                score += Math.min(15, surveyor.surveyorProfile.certifications.length * 5);
            }

            // Score for availability
            if (surveyor.surveyorProfile?.availability === 'Available') {
                score += 15;
            } else if (surveyor.surveyorProfile?.availability === 'Limited') {
                score += 5;
            }

            return {
                surveyor,
                score,
                matchReasons: this.getMatchReasons(surveyor, criteria, score)
            };
        });

        // Sort by score (highest first)
        scored.sort((a, b) => b.score - a.score);

        return scored.map(s => ({
            id: s.surveyor._id,
            name: s.surveyor.name,
            email: s.surveyor.email,
            phone: s.surveyor.phone,
            location: s.surveyor.location,
            profile: s.surveyor.surveyorProfile,
            matchScore: s.score,
            matchReasons: s.matchReasons
        }));
    }

    /**
     * Get reasons why surveyor matches
     */
    getMatchReasons(surveyor, criteria, score) {
        const reasons = [];

        if (score >= 80) {
            reasons.push('Excellent match for your requirements');
        } else if (score >= 60) {
            reasons.push('Good match for your requirements');
        }

        if (criteria.propertyType && surveyor.surveyorProfile?.specializations) {
            const specializationMap = {
                'Residential': 'Residential',
                'Commercial': 'Commercial',
                'Land': 'Land'
            };
            if (surveyor.surveyorProfile.specializations.includes(specializationMap[criteria.propertyType])) {
                reasons.push(`Specializes in ${criteria.propertyType} properties`);
            }
        }

        if (criteria.location && surveyor.location) {
            if (surveyor.location.toLowerCase().includes(criteria.location.toLowerCase())) {
                reasons.push(`Located in ${surveyor.location}`);
            }
        }

        if (surveyor.surveyorProfile?.experience) {
            reasons.push(`${surveyor.surveyorProfile.experience} years of experience`);
        }

        if (surveyor.surveyorProfile?.rating >= 4.5) {
            reasons.push(`Highly rated (${surveyor.surveyorProfile.rating}/5)`);
        }

        return reasons;
    }

    /**
     * Attach surveyor to property
     */
    async attachSurveyorToProperty(propertyId, surveyorId, surveyType = 'general') {
        try {
            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            const surveyor = await User.findById(surveyorId);
            if (!surveyor || surveyor.role !== 'Surveyor') {
                throw new Error('Surveyor not found');
            }

            // Update property with surveyor attachment
            property.attachedSurveyor = {
                surveyor: surveyorId,
                surveyType,
                attachedAt: new Date(),
                status: 'pending' // pending, scheduled, in-progress, completed
            };

            await property.save();

            return {
                success: true,
                property,
                surveyor,
                message: 'Surveyor successfully attached to property'
            };

        } catch (error) {
            console.error('Error attaching surveyor to property:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get AI recommendation for surveyor selection
     */
    async getAIRecommendation(surveyors, property, surveyType) {
        try {
            if (surveyors.length === 0) {
                return {
                    recommendation: null,
                    reasoning: 'No surveyors available matching your criteria'
                };
            }

            const prompt = `
You are helping select the best surveyor for a property survey.

Property Details:
- Type: ${property.type || 'Not specified'}
- Location: ${property.location || 'Not specified'}
- Purpose: ${property.dealType || 'Not specified'}

Survey Type: ${surveyType}

Available Surveyors:
${surveyors.slice(0, 3).map((s, i) => `
${i + 1}. ${s.name}
   - Location: ${s.location || 'Not specified'}
   - Specializations: ${s.profile?.specializations?.join(', ') || 'General'}
   - Experience: ${s.profile?.experience || 'Not specified'} years
   - Rating: ${s.profile?.rating || 'Not rated'}/5
   - Match Score: ${s.matchScore}/100
`).join('\n')}

Based on the property details and surveyor profiles, provide a recommendation.

Return ONLY a JSON object:
{
    "recommendedSurveyorIndex": 0-2 (index of recommended surveyor),
    "reasoning": "brief explanation of why this surveyor is best suited (1-2 sentences)",
    "confidence": 0-100
}
`;

            const aiRec = await this.callAI(prompt, true);

            if (!aiRec) {
                return {
                    recommendation: surveyors[0],
                    reasoning: 'Top-ranked surveyor based on match score'
                };
            }

            const recommendedIndex = Math.min(aiRec.recommendedSurveyorIndex || 0, surveyors.length - 1);

            return {
                recommendation: surveyors[recommendedIndex],
                reasoning: aiRec.reasoning,
                confidence: aiRec.confidence
            };

        } catch (error) {
            console.error('Error getting AI recommendation:', error);
            return {
                recommendation: surveyors[0],
                reasoning: 'Top-ranked surveyor based on match score'
            };
        }
    }
}

module.exports = new SurveyorMatchingService();
