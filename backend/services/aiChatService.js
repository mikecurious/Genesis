const Property = require('../models/Property');

class AIChatService {
    constructor() {
        this.conversationContext = new Map();
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

        // Detect property type
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
            if (keywords.some(keyword => queryLower.includes(keyword))) {
                filters.propertyType = type;
                break;
            }
        }

        // Detect locations (Kenyan cities and neighborhoods)
        const locations = [
            'westlands', 'kilimani', 'karen', 'lavington', 'kileleshwa',
            'upperhill', 'runda', 'muthaiga', 'parklands', 'ngong',
            'kasarani', 'embakasi', 'syokimau', 'kitengela', 'ruaka',
            'mombasa', 'kisumu', 'nakuru', 'eldoret', 'thika',
            'nyali', 'bamburi', 'diani', 'nairobi', 'cbd'
        ];

        for (const location of locations) {
            if (queryLower.includes(location)) {
                filters.location = location;
                break;
            }
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

            // Use word boundary regex for precise location matching
            if (filters.location) {
                const locationPattern = filters.location
                    .split(',')
                    .map(loc => loc.trim())
                    .filter(loc => loc.length > 0)
                    .map(loc => `\\b${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
                    .join('|');

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
}

module.exports = new AIChatService();
