const Groq = require('groq-sdk');

class GroqService {
    constructor() {
        this.client = null;
        this.initialize();
    }

    /**
     * Initialize Groq client
     */
    initialize() {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.warn('⚠️  GROQ_API_KEY not configured. AI chat will use fallback responses.');
            return;
        }

        this.client = new Groq({
            apiKey: apiKey
        });

        console.log('✅ Groq AI service initialized');
    }

    /**
     * Check if Groq is available
     */
    isAvailable() {
        return this.client !== null;
    }

    /**
     * Generate property search response using Groq
     * This uses RAG approach - properties data is provided as context
     */
    async generatePropertySearchResponse(query, properties, filters) {
        if (!this.isAvailable()) {
            return this.getFallbackResponse(properties, filters);
        }

        try {
            // Prepare property data for context (limit to essential info to save tokens)
            const propertyContext = properties.slice(0, 10).map(p => ({
                id: p._id?.toString() || p.id,
                title: p.title,
                location: p.location,
                price: p.price,
                currency: p.currency,
                priceType: p.priceType,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                propertyType: p.propertyType,
                amenities: p.amenities,
                description: p.description?.substring(0, 200) // Limit description length
            }));

            const systemPrompt = `You are a helpful real estate AI assistant for MyGF AI Real Estate Platform in Kenya.

IMPORTANT RULES:
1. ONLY recommend properties from the provided property list below
2. DO NOT make up or suggest properties that aren't in the list
3. Be specific - mention property titles, locations, and prices from the actual data
4. If no properties match, say so clearly and suggest broadening the search
5. Keep responses concise (2-3 sentences max)
6. Use Kenyan context (KSh currency, Nairobi locations, etc.)
7. Be friendly and helpful

Available Properties:
${JSON.stringify(propertyContext, null, 2)}

Total properties found: ${properties.length}
Search filters applied: ${JSON.stringify(filters, null, 2)}`;

            const userMessage = `User query: "${query}"

Please provide a helpful response about these properties. Be specific and only mention properties from the list above.`;

            const completion = await this.client.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                model: 'llama-3.3-70b-versatile', // Fast and accurate Llama model
                temperature: 0.3, // Lower temperature for more factual responses
                max_tokens: 300,
                top_p: 0.9,
                stream: false
            });

            const response = completion.choices[0]?.message?.content;

            if (!response) {
                return this.getFallbackResponse(properties, filters);
            }

            return response.trim();

        } catch (error) {
            console.error('Groq API Error:', error.message);
            return this.getFallbackResponse(properties, filters);
        }
    }

    /**
     * Generate conversational response for follow-up questions
     */
    async generateConversationalResponse(message, context = {}) {
        if (!this.isAvailable()) {
            return "I'm here to help you find properties! What are you looking for?";
        }

        try {
            const systemPrompt = `You are a helpful real estate AI assistant for MyGF AI Real Estate Platform in Kenya.

Keep responses:
- Very brief (1-2 sentences)
- Friendly and conversational
- Focused on helping find properties
- Use Kenyan context`;

            const completion = await this.client.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 150,
                stream: false
            });

            return completion.choices[0]?.message?.content?.trim() ||
                   "I'm here to help you find properties! What are you looking for?";

        } catch (error) {
            console.error('Groq API Error:', error.message);
            return "I'm here to help you find properties! What are you looking for?";
        }
    }

    /**
     * Generate property details response
     */
    async generatePropertyDetailsResponse(property, userQuestion = null) {
        if (!this.isAvailable()) {
            return this.getPropertyDetailsFallback(property);
        }

        try {
            const propertyData = {
                title: property.title,
                location: property.location,
                price: property.price,
                currency: property.currency,
                priceType: property.priceType,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                propertyType: property.propertyType,
                amenities: property.amenities,
                description: property.description,
                squareFeet: property.squareFeet,
                yearBuilt: property.yearBuilt
            };

            const systemPrompt = `You are a helpful real estate AI assistant. Provide information about this specific property:

${JSON.stringify(propertyData, null, 2)}

Rules:
- ONLY provide information from the property data above
- Be specific and factual
- Keep response concise (3-4 sentences)
- Highlight key features
- Use Kenyan context`;

            const userMessage = userQuestion ||
                              `Tell me about this property in a helpful, concise way.`;

            const completion = await this.client.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 250,
                stream: false
            });

            return completion.choices[0]?.message?.content?.trim() ||
                   this.getPropertyDetailsFallback(property);

        } catch (error) {
            console.error('Groq API Error:', error.message);
            return this.getPropertyDetailsFallback(property);
        }
    }

    /**
     * Fallback response when Groq is not available
     */
    getFallbackResponse(properties, filters) {
        if (properties.length === 0) {
            let message = "I couldn't find any properties matching your criteria. ";

            if (filters.priceType === 'sale') {
                message += "You were looking for properties to buy. ";
            } else if (filters.priceType === 'rental') {
                message += "You were looking for rental properties. ";
            }

            if (filters.location) {
                message += `I searched in ${filters.location}. `;
            }

            message += "Try broadening your search!";
            return message;
        }

        const propertyTypeText = filters.propertyType ? `${filters.propertyType}s` : 'properties';
        const locationText = filters.location ? `in ${filters.location}` : 'in various locations';
        const priceTypeText = filters.priceType === 'sale' ? 'for sale' :
                             filters.priceType === 'rental' ? 'for rent' : '';

        return `Great! I found ${properties.length} ${propertyTypeText} ${priceTypeText} ${locationText}.`;
    }

    /**
     * Fallback for property details
     */
    getPropertyDetailsFallback(property) {
        let message = `Here are the details for "${property.title}":\n\n`;
        message += `📍 Location: ${property.location}\n`;
        message += `💰 Price: ${property.currency} ${property.price}`;
        message += property.priceType === 'rental' ? ' per month\n' : '\n';

        if (property.bedrooms) message += `🛏️ Bedrooms: ${property.bedrooms}\n`;
        if (property.bathrooms) message += `🚿 Bathrooms: ${property.bathrooms}\n`;

        return message;
    }

    /**
     * Test Groq connection
     */
    async testConnection() {
        if (!this.isAvailable()) {
            return {
                success: false,
                message: 'Groq API key not configured'
            };
        }

        try {
            const completion = await this.client.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: 'Say "Hello from Groq!" in exactly those words.'
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0,
                max_tokens: 50
            });

            return {
                success: true,
                message: completion.choices[0]?.message?.content || 'Connection successful',
                model: 'llama-3.3-70b-versatile'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }
}

module.exports = new GroqService();
