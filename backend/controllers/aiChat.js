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

    // Check if it's a greeting
    const greetings = ['hi', 'hello', 'hey', 'greetings'];
    if (greetings.some(g => messageLower === g || messageLower.startsWith(g + ' '))) {
        return res.status(200).json({
            success: true,
            message: aiChatService.getGreeting(),
            properties: []
        });
    }

    // Otherwise, search for properties
    const result = await aiChatService.searchProperties(message, userId);
    res.status(200).json(result);
});

// @desc    Generate AI response for tenant management
// @route   POST /api/ai-chat/tenant-management
// @access  Public (will be protected later)
exports.tenantManagement = asyncHandler(async (req, res) => {
    const { command, tenants } = req.body;

    if (!command || typeof command !== 'string' || command.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a command'
        });
    }

    if (!Array.isArray(tenants)) {
        return res.status(400).json({
            success: false,
            message: 'Tenants must be an array'
        });
    }

    const response = await aiChatService.generateTenantManagementResponse(command, tenants);

    res.status(200).json({
        success: true,
        message: response
    });
});
