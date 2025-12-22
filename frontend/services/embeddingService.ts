import { GoogleGenAI } from "@google/genai";
import type { Listing } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generate text embedding for semantic search
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            content: text
        });

        return response.embedding.values;
    } catch (error) {
        console.error("Embedding generation error:", error);
        return [];
    }
};

/**
 * Generate embedding for a property listing
 */
export const generatePropertyEmbedding = async (listing: Listing): Promise<number[]> => {
    // Combine all relevant text fields
    const combinedText = `
        ${listing.title}
        ${listing.description}
        ${listing.location}
        ${listing.tags?.join(' ') || ''}
        Price: ${listing.price}
    `.trim();

    return generateEmbedding(combinedText);
};

/**
 * Calculate cosine similarity between two vectors
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
};

/**
 * Find similar properties using semantic search
 */
export const findSimilarProperties = async (
    query: string,
    listings: Listing[],
    topK: number = 5
): Promise<Array<{ listing: Listing; similarity: number }>> => {
    try {
        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query);

        if (queryEmbedding.length === 0) {
            return [];
        }

        // Generate embeddings for all listings (in practice, cache these)
        const listingEmbeddings = await Promise.all(
            listings.map(listing => generatePropertyEmbedding(listing))
        );

        // Calculate similarities
        const similarities = listingEmbeddings.map((embedding, index) => ({
            listing: listings[index],
            similarity: cosineSimilarity(queryEmbedding, embedding)
        }));

        // Sort by similarity and return top K
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);

    } catch (error) {
        console.error("Similar properties search error:", error);
        return [];
    }
};

/**
 * Enhanced property matching with intent understanding
 */
export const semanticPropertyMatch = async (
    userQuery: string,
    listings: Listing[]
): Promise<{
    matches: Listing[];
    reasoning: string;
    confidence: number;
}> => {
    try {
        // Use AI to understand the intent
        const intentPrompt = `Analyze this property search query and extract the key requirements:

Query: "${userQuery}"

**Extract:**
1. Budget range (if mentioned)
2. Location preferences
3. Property type (apartment, house, etc.)
4. Must-have features
5. Lifestyle preferences (family-friendly, modern, quiet, etc.)

**Response Format (JSON):**
{
    "budget": "range or null",
    "locations": ["location1", "location2"],
    "propertyType": "type or null",
    "mustHaveFeatures": ["feature1", "feature2"],
    "lifestylePreferences": ["preference1", "preference2"],
    "intent": "Brief summary of what they're looking for"
}`;

        const intentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: intentPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const intent = JSON.parse(intentResponse.text.trim());

        // Use semantic search to find matches
        const similarProperties = await findSimilarProperties(userQuery, listings, 10);

        // Filter based on extracted intent
        const filteredMatches = similarProperties.filter(({ listing, similarity }) => {
            // Similarity threshold
            if (similarity < 0.5) return false;

            // Location filter
            if (intent.locations.length > 0) {
                const matchesLocation = intent.locations.some((loc: string) =>
                    listing.location.toLowerCase().includes(loc.toLowerCase())
                );
                if (!matchesLocation) return false;
            }

            return true;
        });

        // Calculate confidence based on number of matches and similarity scores
        const avgSimilarity = filteredMatches.reduce((sum, m) => sum + m.similarity, 0) / filteredMatches.length;
        const confidence = Math.min(Math.round(avgSimilarity * 100), 100);

        return {
            matches: filteredMatches.slice(0, 5).map(m => m.listing),
            reasoning: intent.intent,
            confidence
        };

    } catch (error) {
        console.error("Semantic property match error:", error);
        return {
            matches: [],
            reasoning: "Unable to process query",
            confidence: 0
        };
    }
};

/**
 * Get property recommendations based on user preferences
 */
export const getPersonalizedRecommendations = async (
    userPreferences: {
        viewedProperties: string[];
        likedFeatures: string[];
        budgetRange?: { min: number; max: number };
    },
    allListings: Listing[],
    count: number = 5
): Promise<Listing[]> => {
    try {
        // Create a preference profile
        const preferenceText = `
            User likes properties with: ${userPreferences.likedFeatures.join(', ')}
            Budget: ${userPreferences.budgetRange ? `${userPreferences.budgetRange.min} - ${userPreferences.budgetRange.max}` : 'flexible'}
        `;

        const preferenceEmbedding = await generateEmbedding(preferenceText);

        // Filter out already viewed properties
        const unseenListings = allListings.filter(
            listing => !userPreferences.viewedProperties.includes(listing.id)
        );

        // Generate embeddings and find similar
        const listingEmbeddings = await Promise.all(
            unseenListings.map(listing => generatePropertyEmbedding(listing))
        );

        const similarities = listingEmbeddings.map((embedding, index) => ({
            listing: unseenListings[index],
            similarity: cosineSimilarity(preferenceEmbedding, embedding)
        }));

        // Return top recommendations
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, count)
            .map(s => s.listing);

    } catch (error) {
        console.error("Personalized recommendations error:", error);
        return allListings.slice(0, count);
    }
};

/**
 * Cache embeddings to improve performance
 */
interface EmbeddingCache {
    [key: string]: {
        embedding: number[];
        timestamp: number;
    };
}

const embeddingCache: EmbeddingCache = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const getCachedEmbedding = async (text: string): Promise<number[]> => {
    const cacheKey = text.substring(0, 100); // Use first 100 chars as key

    // Check cache
    if (embeddingCache[cacheKey]) {
        const cached = embeddingCache[cacheKey];
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.embedding;
        }
    }

    // Generate new embedding
    const embedding = await generateEmbedding(text);

    // Store in cache
    embeddingCache[cacheKey] = {
        embedding,
        timestamp: Date.now()
    };

    return embedding;
};
