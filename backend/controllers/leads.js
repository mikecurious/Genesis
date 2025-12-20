const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const whatsappService = require('../services/whatsappService');
const { createNotification } = require('./notifications');

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

    // Send WhatsApp notification to property owner if enabled
    const owner = property.createdBy;
    if (owner.whatsappNumber && owner.notificationPreferences?.whatsapp) {
        const whatsappResult = await whatsappService.sendLeadNotification(
            owner.whatsappNumber,
            { client, dealType },
            property.title
        );

        if (whatsappResult.success) {
            console.log(`✅ WhatsApp notification sent to owner for lead ${lead._id}`);
        } else {
            console.error(`❌ Failed to send WhatsApp notification: ${whatsappResult.error}`);
        }
    }

    // Create in-app notification for property owner
    try {
        await createNotification({
            userId: property.createdBy._id,
            title: 'New Lead Captured',
            message: `New ${dealType} lead for ${property.title}`,
            type: 'lead',
            relatedId: lead._id
        });
    } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
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
