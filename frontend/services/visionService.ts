import { GoogleGenAI } from "@google/genai";
import type { Listing } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Analyze a property image using Gemini Vision
 * Extracts features, condition, and generates description
 */
export const analyzePropertyImage = async (imageUrl: string): Promise<{
    description: string;
    features: string[];
    condition: string;
    suggestedPrice?: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
}> => {
    try {
        // Fetch image and convert to base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        const mimeType = blob.type;

        const modelPrompt = `You are an expert real estate analyst. Analyze this property image in detail.

**Your Task:**
1. Describe what you see (rooms, style, condition)
2. List key features (e.g., "hardwood floors", "modern kitchen", "spacious balcony")
3. Assess the overall condition (excellent/good/fair/poor)
4. Rate the image quality for a listing (excellent/good/fair/poor)
5. If possible, suggest a price range based on visible features

**Response Format (JSON):**
{
    "description": "Detailed description of the property",
    "features": ["feature1", "feature2", "feature3"],
    "condition": "excellent/good/fair/poor",
    "quality": "excellent/good/fair/poor",
    "suggestedPrice": "Optional price range"
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [
                { text: modelPrompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const analysis = JSON.parse(result.text.trim());
        return analysis;

    } catch (error) {
        console.error("Image analysis error:", error);
        return {
            description: "Unable to analyze image",
            features: [],
            condition: "fair",
            quality: "fair"
        };
    }
};

/**
 * Generate a comprehensive property description from multiple images
 */
export const generateDescriptionFromImages = async (imageUrls: string[]): Promise<string> => {
    try {
        // Analyze first 3 images (to avoid token limits)
        const imagesToAnalyze = imageUrls.slice(0, 3);
        const analyses = await Promise.all(
            imagesToAnalyze.map(url => analyzePropertyImage(url))
        );

        // Combine insights
        const allFeatures = [...new Set(analyses.flatMap(a => a.features))];
        const descriptions = analyses.map(a => a.description).join(' ');

        const modelPrompt = `Based on these property image analyses, write a compelling, professional property description.

**Image Analyses:**
${JSON.stringify(analyses, null, 2)}

**Combined Features:**
${allFeatures.join(', ')}

**Your Task:**
Write a 2-3 paragraph property description that:
1. Highlights the best features
2. Creates an inviting atmosphere
3. Is professional yet engaging
4. Mentions the condition and quality

Respond with ONLY the description text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: modelPrompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Description generation error:", error);
        return "Beautiful property with great potential. Contact us for more details.";
    }
};

/**
 * Suggest better photo angles and improvements
 */
export const suggestPhotoImprovements = async (imageUrl: string): Promise<{
    suggestions: string[];
    missingShots: string[];
    overallScore: number;
}> => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        const mimeType = blob.type;

        const modelPrompt = `You are a professional real estate photographer. Analyze this property photo.

**Your Task:**
1. Rate the photo quality (0-100)
2. Suggest improvements (lighting, angle, composition)
3. Identify missing shots that would help sell the property

**Response Format (JSON):**
{
    "overallScore": 85,
    "suggestions": ["Better lighting", "Wider angle"],
    "missingShots": ["Kitchen close-up", "Bathroom"]
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [
                { text: modelPrompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64.split(',')[1]
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        return JSON.parse(result.text.trim());

    } catch (error) {
        console.error("Photo improvement suggestions error:", error);
        return {
            suggestions: [],
            missingShots: [],
            overallScore: 50
        };
    }
};

/**
 * Helper function to convert Blob to base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Batch analyze all property images
 */
export const batchAnalyzePropertyImages = async (listing: Listing): Promise<{
    overallQuality: number;
    bestImage: string;
    improvements: string[];
    autoDescription: string;
}> => {
    try {
        const analyses = await Promise.all(
            listing.imageUrls.map(url => analyzePropertyImage(url))
        );

        // Find best quality image
        const bestAnalysis = analyses.reduce((best, current) => {
            const qualityScore = { excellent: 4, good: 3, fair: 2, poor: 1 };
            return qualityScore[current.quality] > qualityScore[best.quality] ? current : best;
        });

        const bestImageIndex = analyses.indexOf(bestAnalysis);
        const bestImage = listing.imageUrls[bestImageIndex];

        // Calculate overall quality
        const qualityScores = { excellent: 100, good: 75, fair: 50, poor: 25 };
        const avgQuality = analyses.reduce((sum, a) => sum + qualityScores[a.quality], 0) / analyses.length;

        // Generate auto description
        const autoDescription = await generateDescriptionFromImages(listing.imageUrls);

        // Collect improvement suggestions
        const improvements = [...new Set(analyses.flatMap(a =>
            a.quality !== 'excellent' ? [`Improve ${a.quality} quality image`] : []
        ))];

        return {
            overallQuality: Math.round(avgQuality),
            bestImage,
            improvements,
            autoDescription
        };

    } catch (error) {
        console.error("Batch analysis error:", error);
        return {
            overallQuality: 50,
            bestImage: listing.imageUrls[0] || '',
            improvements: [],
            autoDescription: listing.description
        };
    }
};
