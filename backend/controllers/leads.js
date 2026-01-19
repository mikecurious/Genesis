const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const whatsappService = require('../services/whatsappService');
const { createNotification } = require('./notifications');
const agentNotificationService = require('../services/agentNotificationService');
const leadScoringService = require('../services/leadScoringService');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public (client submits from PropertyExplorerPage)
exports.createLead = asyncHandler(async (req, res) => {
    const { propertyId, client, dealType, conversationHistory } = req.body;

    // Validate required fields
    if (!propertyId || !client || !dealType) {
        return res.status(400).json({
            success: false,
            message: 'Please provide property ID, client details, and deal type'
        });
    }

    // Get property to find the owner
    const property = await Property.findById(propertyId).populate('createdBy');

    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Create lead
    const lead = await Lead.create({
        property: propertyId,
        client,
        dealType,
        conversationHistory: conversationHistory || [],
        createdBy: property.createdBy._id,
        status: 'new'
    });

    // Populate property details
    await lead.populate('property');

    // Track interaction metadata
    lead.aiEngagement = lead.aiEngagement || {
        totalInteractions: 0,
        aiActions: [],
        interactionMetrics: {}
    };

    lead.aiEngagement.aiActions.push({
        action: 'lead_captured',
        timestamp: new Date(),
        success: true,
        reasoning: 'User clicked Connect Now',
        outcome: 'Lead successfully created',
        interactionType: 'connect_now',
        interactionSource: req.body.source || 'property_explorer',
        metadata: {
            propertyViewed: true,
            conversationLength: conversationHistory?.length || 0,
            responseTime: Date.now() - (req.body.sessionStartTime || Date.now()),
            userAgent: req.headers['user-agent'],
            referrer: req.headers.referer
        }
    });

    lead.aiEngagement.interactionMetrics = lead.aiEngagement.interactionMetrics || {};
    lead.aiEngagement.interactionMetrics.totalConnectNowClicks =
        (lead.aiEngagement.interactionMetrics.totalConnectNowClicks || 0) + 1;
    lead.aiEngagement.interactionMetrics.firstInteractionAt = new Date();
    lead.aiEngagement.interactionMetrics.lastInteractionAt = new Date();
    lead.aiEngagement.totalInteractions = (lead.aiEngagement.totalInteractions || 0) + 1;

    await lead.save();

    // Calculate initial lead score with enhanced factors
    try {
        const scoringResult = await leadScoringService.calculateLeadScore(lead, property);
        lead.score = scoringResult.score;
        lead.scoreBreakdown = scoringResult.scoreBreakdown;
        lead.buyingIntent = scoringResult.buyingIntent;
        await lead.save();
    } catch (scoringError) {
        console.error('Failed to calculate lead score:', scoringError);
    }

    // Send multi-channel notifications via agentNotificationService
    try {
        const notificationResult = await agentNotificationService.notifyLeadCaptured(lead._id);
        if (notificationResult.success) {
            console.log(`✅ Notifications sent for lead ${lead._id}`);
        } else {
            console.error(`❌ Failed to send notifications: ${notificationResult.error}`);
        }
    } catch (notificationError) {
        console.error('Failed to send agent notifications:', notificationError);
    }

    res.status(201).json({
        success: true,
        data: lead,
        message: 'Lead captured successfully!'
    });
});

// @desc    Get all leads for logged-in user
// @route   GET /api/leads
// @access  Private
exports.getLeads = asyncHandler(async (req, res) => {
    const { status, dealType } = req.query;

    // Build filter
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (dealType) filter.dealType = dealType;

    const leads = await Lead.find(filter)
        .populate('property', 'title location price imageUrls')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
    });
});

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
exports.getLeadById = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id)
        .populate('property')
        .populate('createdBy', 'name email');

    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Make sure user owns this lead
    if (lead.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this lead'
        });
    }

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Update lead status
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = asyncHandler(async (req, res) => {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Make sure user owns this lead
    if (lead.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this lead'
        });
    }

    // Update fields
    const { status, notes } = req.body;
    if (status) lead.status = status;
    if (notes !== undefined) lead.notes = notes;

    // Set closedAt if status is closed
    if (status === 'closed' && !lead.closedAt) {
        lead.closedAt = Date.now();
    }

    await lead.save();

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Make sure user owns this lead
    if (lead.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this lead'
        });
    }

    await lead.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Lead deleted successfully'
    });
});

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private
exports.getLeadStats = asyncHandler(async (req, res) => {
    const stats = await Lead.aggregate([
        { $match: { createdBy: req.user._id } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const dealTypeStats = await Lead.aggregate([
        { $match: { createdBy: req.user._id } },
        {
            $group: {
                _id: '$dealType',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            byStatus: stats,
            byDealType: dealTypeStats
        }
    });
});
