import { type Listing } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Main fetch function with auth headers
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const token = getToken();
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

/**
 * Smart property search using AI-powered semantic matching
 */
export const smartPropertySearch = async (
    query: string,
    filters?: {
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
        propertyType?: string;
        location?: string;
    },
    limit: number = 10
): Promise<{
    success: boolean;
    data: Listing[];
    confidence: number;
    message: string;
}> => {
    try {
        const response = await apiFetch('/properties/smart-search', {
            method: 'POST',
            body: JSON.stringify({ query, filters, limit }),
        });

        return response;
    } catch (error) {
        console.error('Smart search error:', error);
        throw error;
    }
};

/**
 * Generate semantic tags for a property
 */
export const generatePropertyTags = async (propertyId: string): Promise<any> => {
    try {
        const response = await apiFetch(`/properties/${propertyId}/generate-tags`, {
            method: 'POST',
        });

        return response;
    } catch (error) {
        console.error('Generate tags error:', error);
        throw error;
    }
};

/**
 * Update property embedding for semantic search
 */
export const updatePropertyEmbedding = async (propertyId: string): Promise<any> => {
    try {
        const response = await apiFetch(`/properties/${propertyId}/update-embedding`, {
            method: 'POST',
        });

        return response;
    } catch (error) {
        console.error('Update embedding error:', error);
        throw error;
    }
};

/**
 * Client-side semantic search using existing embedding service
 * This is a fallback when backend search is not available
 */
export const clientSideSemanticSearch = async (
    query: string,
    listings: Listing[],
    topK: number = 5
): Promise<Listing[]> => {
    try {
        // Import embedding service dynamically to avoid circular dependencies
        const { findSimilarProperties } = await import('./embeddingService');

        const results = await findSimilarProperties(query, listings, topK);
        return results.map(r => r.listing);
    } catch (error) {
        console.error('Client-side semantic search error:', error);
        // Fallback to simple text matching
        return listings.filter(listing =>
            listing.title.toLowerCase().includes(query.toLowerCase()) ||
            listing.description.toLowerCase().includes(query.toLowerCase()) ||
            listing.location.toLowerCase().includes(query.toLowerCase())
        ).slice(0, topK);
    }
};
