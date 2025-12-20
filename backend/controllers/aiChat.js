const asyncHandler = require('express-async-handler');
const aiChatService = require('../services/aiChatService');

// @desc    Chat with AI to search for properties
// @route   POST /api/ai-chat/search
// @access  Public
exports.chatSearch = asyncHandler(async (req, res) => {
    const { query } = req.body;
    const userId = req.user?.id || null;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a search query'
        });
    }

    const result = await aiChatService.searchProperties(query, userId);

    res.status(200).json(result);
});

// @desc    Get property details with AI assistance
// @route   GET /api/ai-chat/property/:id
// @access  Public
exports.getPropertyWithAI = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id || null;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Property ID is required'
        });
    }

    const result = await aiChatService.getPropertyDetails(id, userId);

    if (!result.success) {
        return res.status(404).json(result);
    }

    res.status(200).json(result);
});

// @desc    Get AI greeting message
// @route   GET /api/ai-chat/greeting
// @access  Public
exports.getGreeting = asyncHandler(async (req, res) => {
    const greeting = aiChatService.getGreeting();

    res.status(200).json({
        success: true,
        message: greeting
    });
});

// @desc    Get conversation context for a user
// @route   GET /api/ai-chat/context
// @access  Private
exports.getContext = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const context = aiChatService.getConversationContext(userId);

    res.status(200).json({
        success: true,
        context: context
    });
});

// @desc    Clear conversation context
// @route   DELETE /api/ai-chat/context
// @access  Private
exports.clearContext = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    aiChatService.clearConversationContext(userId);

    res.status(200).json({
        success: true,
        message: 'Conversation context cleared'
    });
});

// @desc    Process conversational query (handles greetings, follow-ups, etc.)
// @route   POST /api/ai-chat/message
// @access  Public
exports.processMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const userId = req.user?.id || null;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a message'
        });
    }

    const messageLower = message.toLowerCase().trim();

    // Handle greetings
    const greetingPatterns = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    if (greetingPatterns.some(pattern => messageLower.includes(pattern))) {
        const greeting = aiChatService.getGreeting();
        return res.status(200).json({
            success: true,
            message: greeting,
            type: 'greeting',
            suggestions: [
                "Show me apartments for rent in Westlands",
                "I want to buy a 3-bedroom house in Karen",
                "Find me affordable properties under 50,000 KSh",
                "What properties do you have in Kilimani?"
            ]
        });
    }

    // Handle help requests
    const helpPatterns = ['help', 'what can you do', 'how does this work', 'guide'];
    if (helpPatterns.some(pattern => messageLower.includes(pattern))) {
        return res.status(200).json({
            success: true,
            message: "I can help you find properties in Kenya! Here's what I can do:\n\n" +
                     "🏠 Search for properties to buy or rent\n" +
                     "🔍 Filter by bedrooms, bathrooms, location, and price\n" +
                     "📍 Find properties in specific areas\n" +
                     "💰 Show properties within your budget\n\n" +
                     "Just tell me what you're looking for in plain English!",
            type: 'help',
            suggestions: [
                "Show me 2-bedroom apartments in Kilimani",
                "I want to buy a house in Westlands",
                "Find rental properties under 60,000 KSh",
                "What's available in Karen?"
            ]
        });
    }

    // Handle thank you messages
    const thankPatterns = ['thank', 'thanks', 'appreciate'];
    if (thankPatterns.some(pattern => messageLower.includes(pattern))) {
        return res.status(200).json({
            success: true,
            message: "You're welcome! Let me know if you need help finding more properties.",
            type: 'acknowledgment',
            suggestions: [
                "Search for different properties",
                "Refine my search",
                "Show me luxury properties"
            ]
        });
    }

    // Default to property search
    const result = await aiChatService.searchProperties(message, userId);

    res.status(200).json({
        ...result,
        type: 'search'
    });
});
