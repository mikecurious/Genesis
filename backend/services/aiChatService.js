const Property = require('../models/Property');
const { LRUCache } = require('lru-cache');
const locationMatcher = require('./locationMatcherService');

class AIChatService {
    constructor() {
        // Use LRU cache to prevent memory leak from indefinite Map growth
        // max: 1000 entries, ttl: 30 minutes (1800000 ms)
        this.conversationContext = new LRUCache({
            max: 1000,
            ttl: 1800000,
            updateAgeOnGet: true
        });
    }

    parseUserQuery(query) {
        const queryLower = query.toLowerCase();

        const filters = {
            minPrice: null,
            maxPrice: null,
            bedrooms: null,
            bathrooms: null,
            propertyType: null,
            location: null,
            priceType: null
        };

        // Detect price type (sale vs rental)
        const buyKeywords = ['buy', 'purchase', 'invest', 'own', 'sale', 'selling'];
        const rentKeywords = ['rent', 'rental', 'lease', 'monthly', 'tenant', 'renting'];

        const hasBuyIntent = buyKeywords.some(keyword => queryLower.includes(keyword));
        const hasRentIntent = rentKeywords.some(keyword => queryLower.includes(keyword));

        if (hasBuyIntent && !hasRentIntent) {
            filters.priceType = 'sale';
        } else if (hasRentIntent && !hasBuyIntent) {
            filters.priceType = 'rental';
        }

        // Extract bedroom count
        const bedroomMatch = queryLower.match(/(\d+)\s*(?:bed|bedroom)/i);
        if (bedroomMatch) {
            filters.bedrooms = parseInt(bedroomMatch[1]);
        }

        // Extract bathroom count
        const bathroomMatch = queryLower.match(/(\d+)\s*(?:bath|bathroom)/i);
        if (bathroomMatch) {
            filters.bathrooms = parseInt(bathroomMatch[1]);
        }

        // Detect property type - use word boundaries to avoid partial matches
        const propertyTypes = {
            'apartment': ['apartment', 'flat'],
            'house': ['house', 'home'],
            'villa': ['villa'],
            'studio': ['studio'],
            'townhouse': ['townhouse'],
            'land': ['land', 'plot'],
            'commercial': ['commercial', 'office'],
            'condo': ['condo', 'condominium']
        };

        for (const [type, keywords] of Object.entries(propertyTypes)) {
            // Use word boundary regex to match whole words only
            if (keywords.some(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                return regex.test(queryLower);
            })) {
                filters.propertyType = type;
                break;
            }
        }

        // Detect locations using advanced location matcher
        // This handles fuzzy matching, aliases, and regional queries
        const detectedLocation = locationMatcher.getBestMatch(query);
        if (detectedLocation) {
            filters.location = detectedLocation;
        }

        // Extract price range
        const pricePatterns = [
            /(?:under|below|less than|max)\s*(?:ksh|kes|sh)?\s*([\d,]+)/i,
            /(?:above|over|more than|min)\s*(?:ksh|kes|sh)?\s*([\d,]+)/i,
            /(?:ksh|kes|sh)?\s*([\d,]+)\s*(?:to|-)\s*(?:ksh|kes|sh)?\s*([\d,]+)/i
        ];

        for (const pattern of pricePatterns) {
            const match = query.match(pattern);
            if (match) {
                if (pattern.source.includes('under|below')) {
                    filters.maxPrice = parseInt(match[1].replace(/,/g, ''));
                } else if (pattern.source.includes('above|over')) {
                    filters.minPrice = parseInt(match[1].replace(/,/g, ''));
                } else if (match[2]) {
                    filters.minPrice = parseInt(match[1].replace(/,/g, ''));
                    filters.maxPrice = parseInt(match[2].replace(/,/g, ''));
                }
                break;
            }
        }

        return filters;
    }

    async searchProperties(query, userId = null) {
        try {
            const filters = this.parseUserQuery(query);

            const mongoFilter = { status: 'active' };

            if (filters.priceType) {
                mongoFilter.priceType = filters.priceType;
            }
            if (filters.bedrooms) {
                mongoFilter.bedrooms = { $gte: filters.bedrooms };
            }
            if (filters.bathrooms) {
                mongoFilter.bathrooms = { $gte: filters.bathrooms };
            }
            if (filters.propertyType) {
                mongoFilter.propertyType = filters.propertyType;
            }

            // Use case-insensitive regex for location matching
            if (filters.location) {
                // Simple case-insensitive match - location field is "Westlands, Nairobi" format
                // So searching for "westlands" or "nairobi" will match
                const locationPattern = filters.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                mongoFilter.location = { $regex: locationPattern, $options: 'i' };
            }

            const properties = await Property.find(mongoFilter)
                .populate('createdBy', 'name email phone role')
                .sort({ boosted: -1, createdAt: -1 })
                .limit(20);

            const response = this.generateConversationalResponse(query, properties, filters);

            if (userId) {
                this.conversationContext.set(userId, {
                    lastQuery: query,
                    lastFilters: filters,
                    lastResults: properties.length,
                    timestamp: Date.now()
                });
            }

            // Map properties to include 'id' field for frontend compatibility
            const mappedProperties = properties.map(p => ({
                ...p.toObject ? p.toObject() : p,
                id: p._id?.toString() || p.id,
                agentName: p.createdBy?.name || 'Property Agent',
                agentContact: p.createdBy?.email || p.createdBy?.phone || 'N/A',
            }));

            return {
                success: true,
                message: response.message,
                properties: mappedProperties,
                count: mappedProperties.length,
                filters: filters,
                suggestions: response.suggestions
            };

        } catch (error) {
            console.error('AI Chat Service Error:', error);
            throw error;
        }
    }

    generateConversationalResponse(query, properties, filters) {
        let message = '';
        const suggestions = [];

        if (properties.length === 0) {
            message = "I couldn't find any properties matching your criteria. ";

            if (filters.priceType === 'sale') {
                message += "You were looking for properties to buy. ";
                suggestions.push("Try searching for rental properties");
            } else if (filters.priceType === 'rental') {
                message += "You were looking for rental properties. ";
                suggestions.push("Try searching for properties to buy");
            }

            if (filters.location) {
                message += `I searched in ${filters.location}. `;
                suggestions.push("Try a different location like Westlands or Kilimani");
            }

            if (filters.bedrooms) {
                suggestions.push(`Try searching for ${filters.bedrooms - 1} bedroom properties`);
            }

            suggestions.push("Broaden your search criteria");
            suggestions.push("Ask about available locations");

        } else {
            const propertyTypeText = filters.propertyType ? `${filters.propertyType}s` : 'properties';

            // Better location messaging
            let locationText = '';
            if (filters.location) {
                // Extract unique neighborhoods from results
                const neighborhoods = [...new Set(properties.map(p => {
                    const parts = p.location.split(',');
                    return parts[0].trim();
                }))];

                if (neighborhoods.length === 1) {
                    locationText = `in ${neighborhoods[0]}`;
                } else if (neighborhoods.length <= 3) {
                    locationText = `in ${neighborhoods.join(', ')}`;
                } else {
                    locationText = `across ${neighborhoods.length} areas in ${filters.location.charAt(0).toUpperCase() + filters.location.slice(1)}`;
                }
            } else {
                locationText = 'in various locations';
            }

            const priceTypeText = filters.priceType === 'sale' ? 'for sale' :
                                 filters.priceType === 'rental' ? 'for rent' : '';

            message = `Great! I found ${properties.length} ${propertyTypeText} ${priceTypeText} ${locationText}. `;

            if (filters.bedrooms) {
                message += `All have at least ${filters.bedrooms} bedroom${filters.bedrooms > 1 ? 's' : ''}. `;
            }

            const priceRange = this.calculatePriceRange(properties);
            if (priceRange) {
                message += `Prices range from ${priceRange.min} to ${priceRange.max}. `;
            }

            const uniqueLocations = [...new Set(properties.map(p => p.location))];
            if (uniqueLocations.length > 1 && uniqueLocations.length <= 5) {
                suggestions.push(`Narrow down: ${uniqueLocations.slice(0, 3).join(' • ')}`);
            }

            suggestions.push("Show me property details");
            suggestions.push("Filter by price or bedrooms");
            if (filters.priceType !== 'sale') suggestions.push("Show properties for sale");
            if (filters.priceType !== 'rental') suggestions.push("Show rentals");
        }

        return { message, suggestions };
    }

    calculatePriceRange(properties) {
        if (properties.length === 0) return null;

        const prices = properties.map(p => {
            const priceStr = p.price.replace(/[^0-9]/g, '');
            return parseInt(priceStr) || 0;
        }).filter(p => p > 0);

        if (prices.length === 0) return null;

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return {
            min: this.formatPrice(min),
            max: this.formatPrice(max)
        };
    }

    formatPrice(price) {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M KSh`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K KSh`;
        }
        return `${price} KSh`;
    }

    async getPropertyDetails(propertyId, userId = null) {
        try {
            const property = await Property.findById(propertyId)
                .populate('createdBy', 'name email phone role surveyorProfile');

            if (!property) {
                return {
                    success: false,
                    message: "Sorry, I couldn't find that property. It may have been sold or removed."
                };
            }

            const details = this.formatPropertyDetails(property);

            return {
                success: true,
                message: details.message,
                property: property,
                contactInfo: details.contactInfo
            };

        } catch (error) {
            console.error('Get Property Details Error:', error);
            throw error;
        }
    }

    formatPropertyDetails(property) {
        let message = `Here are the details for "${property.title}":\n\n`;
        message += `📍 Location: ${property.location}\n`;
        message += `💰 Price: ${property.price}`;
        message += property.priceType === 'rental' ? ' per month\n' : '\n';

        if (property.bedrooms) {
            message += `🛏️ Bedrooms: ${property.bedrooms}\n`;
        }
        if (property.bathrooms) {
            message += `🚿 Bathrooms: ${property.bathrooms}\n`;
        }
        if (property.squareFeet) {
            message += `📐 Size: ${property.squareFeet} sq ft\n`;
        }
        if (property.propertyType) {
            message += `🏠 Type: ${property.propertyType}\n`;
        }

        message += `\n${property.description}\n`;

        if (property.amenities && property.amenities.length > 0) {
            message += `\n✨ Amenities: ${property.amenities.join(', ')}`;
        }

        const contactInfo = {
            agent: property.createdBy?.name || 'Property Agent',
            role: property.createdBy?.role || 'Agent',
            email: property.createdBy?.email,
            phone: property.createdBy?.phone
        };

        return { message, contactInfo };
    }

    getGreeting() {
        const greetings = [
            "Hello! I'm your AI property assistant. How can I help you find your dream property today?",
            "Hi there! Looking for a property? Tell me what you're searching for!",
            "Welcome! I can help you find properties for sale or rent in Kenya. What are you looking for?",
            "Greetings! Ready to find your perfect property? Just tell me your preferences!"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getConversationContext(userId) {
        return this.conversationContext.get(userId) || null;
    }

    clearConversationContext(userId) {
        this.conversationContext.delete(userId);
    }

    /**
     * Detect surveyor request intent from user message
     */
    detectSurveyorIntent(message) {
        const messageLower = message.toLowerCase();

        const surveyorKeywords = [
            'surveyor', 'valuer', 'valuation', 'survey', 'inspection',
            'assess', 'appraisal', 'appraiser', 'evaluate', 'evaluation',
            'inspection report', 'property inspection'
        ];

        return surveyorKeywords.some(keyword => messageLower.includes(keyword));
    }

    /**
     * Extract property reference from message
     */
    extractPropertyReference(message) {
        const messageLower = message.toLowerCase();

        // Look for "this property", "property [title]", etc.
        const patterns = [
            /(?:this|the)\s+property/i,
            /property\s+(?:id|#)\s*:?\s*([a-f0-9]{24})/i,
            /for\s+(.+?)\s+(?:property|listing)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1] || 'current';
            }
        }

        return null;
    }

    /**
     * Determine survey type from message
     */
    determineSurveyType(message) {
        const messageLower = message.toLowerCase();

        if (messageLower.includes('valuation') || messageLower.includes('value') || messageLower.includes('appraisal')) {
            return 'valuation';
        } else if (messageLower.includes('inspection') || messageLower.includes('inspect')) {
            return 'inspection';
        } else if (messageLower.includes('compliance') || messageLower.includes('regulatory')) {
            return 'compliance';
        }

        return 'inspection'; // Default
    }

    /**
     * Find best matching surveyor based on criteria
     */
    async findBestSurveyor(propertyType, surveyType, location = null) {
        try {
            const User = require('../models/User');

            // Build query to find available surveyors
            const query = {
                role: 'Surveyor',
                accountStatus: 'active',
                'surveyorProfile.availability': 'Available'
            };

            // Match specialization to property type
            if (propertyType) {
                const specializationMap = {
                    'apartment': 'Residential',
                    'house': 'Residential',
                    'villa': 'Residential',
                    'townhouse': 'Residential',
                    'studio': 'Residential',
                    'commercial': 'Commercial',
                    'land': 'Land',
                    'condo': 'Residential'
                };

                const specialization = specializationMap[propertyType] || 'Residential';
                query['surveyorProfile.specializations'] = specialization;
            }

            // Find surveyors and sort by rating and experience
            const surveyors = await User.find(query)
                .sort({
                    'surveyorProfile.rating': -1,
                    'surveyorProfile.yearsOfExperience': -1,
                    'surveyorProfile.completedSurveys': -1
                })
                .limit(5);

            return surveyors;
        } catch (error) {
            console.error('Error finding surveyors:', error);
            return [];
        }
    }

    /**
     * Attach surveyor to property
     */
    async attachSurveyorToProperty(propertyId, surveyorId) {
        try {
            const property = await Property.findById(propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            property.attachedSurveyor = surveyorId;
            property.surveyorAttachedAt = new Date();
            property.surveyStatus = 'pending';

            await property.save();

            return {
                success: true,
                message: 'Surveyor attached to property successfully',
                property
            };
        } catch (error) {
            console.error('Error attaching surveyor:', error);
            throw error;
        }
    }

    /**
     * Process surveyor request from chat
     */
    async processSurveyorRequest(message, userId, propertyId = null) {
        try {
            const User = require('../models/User');

            // If no property specified, ask user to specify
            if (!propertyId) {
                // Get user's properties
                const userProperties = await Property.find({
                    createdBy: userId,
                    status: { $in: ['active', 'sold', 'rented'] }
                }).limit(10);

                if (userProperties.length === 0) {
                    return {
                        success: false,
                        message: "You don't have any properties listed. Please add a property first before requesting a surveyor.",
                        requiresPropertySelection: false
                    };
                }

                return {
                    success: true,
                    message: "I can help you find a surveyor. Which property would you like to have surveyed?",
                    requiresPropertySelection: true,
                    properties: userProperties.map(p => ({
                        id: p._id,
                        title: p.title,
                        location: p.location,
                        type: p.propertyType
                    }))
                };
            }

            // Property specified, find matching surveyors
            const property = await Property.findById(propertyId);
            if (!property) {
                return {
                    success: false,
                    message: "Property not found. Please select a valid property."
                };
            }

            const surveyType = this.determineSurveyType(message);
            const surveyors = await this.findBestSurveyor(property.propertyType, surveyType, property.location);

            if (surveyors.length === 0) {
                return {
                    success: false,
                    message: `I couldn't find any available surveyors for ${property.propertyType} properties at the moment. Please try again later or contact support.`
                };
            }

            // Format surveyor recommendations
            const surveyorRecommendations = surveyors.map(s => ({
                id: s._id,
                name: s.name,
                specializations: s.surveyorProfile.specializations,
                rating: s.surveyorProfile.rating,
                experience: s.surveyorProfile.yearsOfExperience,
                completedSurveys: s.surveyorProfile.completedSurveys,
                services: s.surveyorProfile.services,
                bio: s.surveyorProfile.bio,
                location: s.surveyorProfile.location
            }));

            return {
                success: true,
                message: `Great! I found ${surveyors.length} qualified surveyor${surveyors.length > 1 ? 's' : ''} for your ${property.propertyType} in ${property.location}. Here are my top recommendations based on their ratings and experience.`,
                surveyType,
                property: {
                    id: property._id,
                    title: property.title,
                    location: property.location,
                    type: property.propertyType
                },
                surveyors: surveyorRecommendations,
                requiresSelection: true
            };
        } catch (error) {
            console.error('Error processing surveyor request:', error);
            return {
                success: false,
                message: "I encountered an error processing your surveyor request. Please try again."
            };
        }
    }

    /**
     * Generate AI response for tenant management commands
     * @param {string} command - The landlord's command
     * @param {Array} tenants - List of tenants
     * @returns {Promise<string>} - AI response
     */
    async generateTenantManagementResponse(command, tenants = []) {
        try {
            // Check if Gemini API is available
            const { GoogleGenAI } = require('@google/genai');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
                console.error('GEMINI_API_KEY not configured');
                return "AI service is not available. Please configure the Gemini API key.";
            }

            const ai = new GoogleGenAI({ apiKey });

            const modelPrompt = `You are an AI assistant for a landlord. Your task is to process a command from the landlord regarding their tenants and provide a confirmation message.

Here is the list of tenants:
${JSON.stringify(tenants, null, 2)}

Here is the landlord's command:
"${command}"

Your Task:
1. Understand the landlord's command (e.g., send a reminder, draft an update).
2. Identify which tenants the command applies to based on their rent status or unit.
3. Formulate a brief, professional confirmation message back to the landlord stating what action you have taken. For example: "Okay, I've sent a rent reminder to tenants with an 'Overdue' status: Charlie Brown." or "Drafting a maintenance update for all tenants now."

Respond with ONLY the confirmation text.`;

            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash',
                contents: modelPrompt,
            });

            return response.text.trim();
        } catch (error) {
            console.error("Error generating tenant management response:", error);
            return "I'm sorry, I couldn't process that command. Please try again.";
        }
    }
}

module.exports = new AIChatService();
