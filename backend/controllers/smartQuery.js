
const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');

// Mock embedding generation (in production, this would call Google AI API)
const generateEmbedding = async (text) => {
    // This is a placeholder - in production, integrate with embeddingService
    // For now, return a mock embedding
    return Array(768).fill(0).map(() => Math.random());
};

// Calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

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

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
};

// @desc    Smart property search using AI
// @route   POST /api/properties/smart-search
// @access  Public
exports.smartSearch = asyncHandler(async (req, res) => {
    const { query, filters = {}, limit = 10 } = req.body;

    if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    // Detect buy vs rent intent from query
    const queryLower = query.toLowerCase();
    const buyKeywords = ['buy', 'purchase', 'invest', 'own', 'sale', 'selling'];
    const rentKeywords = ['rent', 'rental', 'lease', 'monthly', 'tenant', 'renting'];

    const hasBuyIntent = buyKeywords.some(keyword => queryLower.includes(keyword));
    const hasRentIntent = rentKeywords.some(keyword => queryLower.includes(keyword));

    let detectedIntent = null;
    if (hasBuyIntent && !hasRentIntent) {
        detectedIntent = 'buy';
    } else if (hasRentIntent && !hasBuyIntent) {
        detectedIntent = 'rent';
    }

    // Build MongoDB filter
    const mongoFilter = { status: 'active' };

    // Filter by priceType based on detected intent
    if (detectedIntent === 'buy') {
        mongoFilter.priceType = 'sale';
    } else if (detectedIntent === 'rent') {
        mongoFilter.priceType = 'rental';
    }
    // If both or neither detected, show all properties

    if (filters.minPrice) mongoFilter.price = { $gte: filters.minPrice };
    if (filters.maxPrice) mongoFilter.price = { ...mongoFilter.price, $lte: filters.maxPrice };
    if (filters.bedrooms) mongoFilter.bedrooms = { $gte: filters.bedrooms };
    if (filters.bathrooms) mongoFilter.bathrooms = { $gte: filters.bathrooms };
    if (filters.propertyType) mongoFilter.propertyType = filters.propertyType;

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

    // Get all matching properties
    const properties = await Property.find(mongoFilter)
        .select('+embedding')
        .populate('createdBy', 'name email')
        .limit(100); // Limit initial fetch for performance

    if (properties.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            message: 'No properties found matching your criteria',
            confidence: 0
        });
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Calculate semantic similarity for each property
    const rankedProperties = properties.map(property => {
        const propertyText = `${property.title} ${property.description} ${property.location} ${property.tags?.join(' ')}`;
        const propertyEmbedding = property.embedding || [];

        const similarity = propertyEmbedding.length > 0
            ? cosineSimilarity(queryEmbedding, propertyEmbedding)
            : 0;

        return {
            property: property.toObject(),
            similarity,
            matchScore: similarity * 100
        };
    });

    // Sort by similarity and return top results
    const topResults = rankedProperties
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    const avgConfidence = topResults.reduce((sum, r) => sum + r.matchScore, 0) / topResults.length;

    res.status(200).json({
        success: true,
        count: topResults.length,
        data: topResults.map(r => ({
            ...r.property,
            id: r.property._id?.toString() || r.property.id,
            agentName: r.property.createdBy?.name || 'Property Agent',
            agentContact: r.property.createdBy?.email || 'N/A',
            matchScore: Math.round(r.matchScore)
        })),
        confidence: Math.round(avgConfidence),
        detectedIntent: detectedIntent || 'general',
        message: detectedIntent
            ? `Found ${topResults.length} properties for ${detectedIntent === 'buy' ? 'sale' : 'rent'} matching your search`
            : `Found ${topResults.length} properties matching your search`
    });
});

// @desc    Generate semantic tags for a property
// @route   POST /api/properties/:id/generate-tags
// @access  Private
exports.generateSemanticTags = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Generate semantic tags based on property details
    const tags = [];

    if (property.bedrooms >= 3) tags.push('family-friendly');
    if (property.bedrooms === 1) tags.push('starter-home');
    if (property.amenities?.includes('pool')) tags.push('luxury');
    if (property.amenities?.includes('gym')) tags.push('modern-amenities');
    if (property.location?.toLowerCase().includes('westlands')) tags.push('prime-location');

    property.semanticTags = tags;
    await property.save();

    res.status(200).json({ success: true, data: property });
});

// @desc    Update property embedding
// @route   POST /api/properties/:id/update-embedding
// @access  Private
exports.updateEmbedding = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const propertyText = `${property.title} ${property.description} ${property.location} ${property.tags?.join(' ')}`;
    const embedding = await generateEmbedding(propertyText);

    property.embedding = embedding;
    await property.save();

    res.status(200).json({
        success: true,
        message: 'Embedding updated successfully',
        data: { id: property._id }
    });
});
