import { GoogleGenAI } from "@google/genai";
import type { Listing } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Detect if user message is a database query
 */
export const detectDatabaseQuery = async (message: string): Promise<boolean> => {
    const prompt = `Is this message asking for data/information from a database? Answer only 'yes' or 'no'.

Message: "${message}"

Examples of database queries:
- "Show me all properties in Nairobi"
- "What's the average rent?"
- "Find 3-bedroom houses"
- "Which tenant has overdue rent?"

Examples of regular conversation:
- "Hello, how are you?"
- "I'm interested in this property"
- "Can you tell me more about the location?"`;

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
    });

    return response.text.trim().toLowerCase().includes('yes');
};

/**
 * Parse natural language into structured query intent
 */
export const parseNaturalLanguage = async (query: string): Promise<{
    intent: string;
    entities: {
        propertyType?: string;
        bedrooms?: number;
        bathrooms?: number;
        minPrice?: number;
        maxPrice?: number;
        location?: string;
        city?: string;
        status?: string;
        amenities?: string[];
    };
    filters: any;
    aggregation?: string;
}> => {
    const prompt = `Parse this real estate database query into structured format.

User Query: "${query}"

Extract:
1. Intent (search, aggregate, count, filter, etc.)
2. Entities (property type, bedrooms, price range, location, etc.)
3. MongoDB filter object
4. Aggregation type if applicable (average, sum, count, max, min)

**Response Format (JSON):**
{
    "intent": "search|aggregate|count",
    "entities": {
        "propertyType": "apartment|house|condo|null",
        "bedrooms": number or null,
        "bathrooms": number or null,
        "minPrice": number or null,
        "maxPrice": number or null,
        "location": "specific area or null",
        "city": "city name or null",
        "status": "active|sold|rented|null",
        "amenities": ["pool", "gym"] or []
    },
    "filters": {
        // MongoDB query object
    },
    "aggregation": "avg|sum|count|max|min|null"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    return JSON.parse(response.text.trim());
};



/**
 * Format query results into natural language response
 */
export const formatQueryResponse = async (
    results: Listing[],
    originalQuery: string,
    reasoning: string
): Promise<string> => {
    const prompt = `Format these database query results into a natural, conversational response.

Original Query: "${originalQuery}"
Results Count: ${results.length}
Reasoning: ${reasoning}

**Your Task:**
Create a friendly, informative response that:
1. Acknowledges the query
2. States the number of results found
3. Highlights key findings if any
4. Suggests next steps

Keep it concise (2-3 sentences).

Respond with ONLY the formatted message.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text.trim();
};

/**
 * Smart chat handler that detects and executes database queries
 */
export const handleSmartChat = async (
    message: string,
    userId: string,
    listings: Listing[]
): Promise<{
    type: 'query' | 'conversation';
    message: string;
    results?: Listing[];
    metadata?: {
        query: string;
        reasoning: string;
        count: number;
    };
}> => {
    // Check if it's a database query
    const isQuery = await detectDatabaseQuery(message);

    if (isQuery) {
        // Execute database query
        const queryResult = await naturalLanguageQuery(message, userId, listings);

        // Format response
        const responseMessage = await formatQueryResponse(
            queryResult.results,
            message,
            queryResult.reasoning
        );

        return {
            type: 'query',
            message: responseMessage,
            results: queryResult.results,
            metadata: {
                query: queryResult.query,
                reasoning: queryResult.reasoning,
                count: queryResult.count
            }
        };
    } else {
        // Regular conversation - use existing chat AI
        return {
            type: 'conversation',
            message: "I'll help you with that. Let me connect you with our AI assistant."
        };
    }
};

/**
 * Generate SQL/MongoDB query explanation for transparency
 */
export const explainQuery = async (query: string): Promise<string> => {
    const prompt = `Explain this database query in simple, non-technical language.

Query: ${query}

Explain what this query does in 1-2 sentences that a non-technical user would understand.`;

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
    });

    return response.text.trim();
};
