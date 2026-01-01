const salesAutomationService = require('../services/salesAutomationService');
const viewingSchedulerService = require('../services/viewingSchedulerService');
const Lead = require('../models/Lead');
const Viewing = require('../models/Viewing');
const asyncHandler = require('express-async-handler');

// @desc    Progress lead through sales funnel
// @route   POST /api/sales-automation/progress/:leadId
// @access  Private
exports.progressLead = asyncHandler(async (req, res) => {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    const result = await salesAutomationService.progressLeadThroughFunnel(leadId);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get sales pipeline overview
// @route   GET /api/sales-automation/pipeline
// @access  Private
exports.getSalesPipeline = asyncHandler(async (req, res) => {
    const { stage, buyingIntent } = req.query;

    const filters = {};
    if (stage) filters.stage = stage;
    if (buyingIntent) filters.buyingIntent = buyingIntent;

    const pipeline = await salesAutomationService.getSalesPipeline(req.user._id, filters);

    res.status(200).json({
        success: true,
        data: pipeline
    });
});

// @desc    Handle lead offer
// @route   POST /api/sales-automation/offer/:leadId
// @access  Private
exports.handleOffer = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const { offerAmount, message } = req.body;

    if (!offerAmount) {
        return res.status(400).json({
            success: false,
            message: 'Please provide offer amount'
        });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership (owner can receive offers, lead can make offers via email/other means)
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    const decision = await salesAutomationService.handleOffer(leadId, offerAmount, message);

    res.status(200).json({
        success: true,
        data: decision,
        message: `Offer ${decision.action}`
    });
});

// @desc    Set negotiation rules for a lead
// @route   PUT /api/sales-automation/negotiation-rules/:leadId
// @access  Private
exports.setNegotiationRules = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const { minAcceptablePrice, maxDiscountPercent, autoAcceptThreshold, requireApprovalBelow } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    // Update negotiation rules
    if (minAcceptablePrice) lead.negotiation.negotiationRules.minAcceptablePrice = minAcceptablePrice;
    if (maxDiscountPercent) lead.negotiation.negotiationRules.maxDiscountPercent = maxDiscountPercent;
    if (autoAcceptThreshold) lead.negotiation.negotiationRules.autoAcceptThreshold = autoAcceptThreshold;
    if (requireApprovalBelow) lead.negotiation.negotiationRules.requireApprovalBelow = requireApprovalBelow;

    await lead.save();

    res.status(200).json({
        success: true,
        data: lead.negotiation.negotiationRules,
        message: 'Negotiation rules updated successfully'
    });
});

// @desc    Enable/disable AI negotiation for a lead
// @route   PATCH /api/sales-automation/ai-negotiation/:leadId
// @access  Private
exports.toggleAINegotiation = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const { enabled } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    lead.negotiation.aiNegotiationEnabled = enabled;
    await lead.save();

    res.status(200).json({
        success: true,
        data: { aiNegotiationEnabled: lead.negotiation.aiNegotiationEnabled },
        message: `AI negotiation ${enabled ? 'enabled' : 'disabled'}`
    });
});

// @desc    Find optimal viewing slots
// @route   GET /api/sales-automation/viewing-slots/:leadId
// @access  Private
exports.getViewingSlots = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const { preferredDates } = req.query; // Comma-separated dates

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    const preferred = preferredDates ? preferredDates.split(',') : [];
    const slots = await viewingSchedulerService.findOptimalViewingSlots(
        leadId,
        lead.property,
        preferred
    );

    res.status(200).json({
        success: true,
        data: slots
    });
});

// @desc    Schedule viewing
// @route   POST /api/sales-automation/schedule-viewing/:leadId
// @access  Private
exports.scheduleViewing = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const { scheduledDate, duration, viewingType, isAIGenerated } = req.body;

    if (!scheduledDate) {
        return res.status(400).json({
            success: false,
            message: 'Please provide scheduled date'
        });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    const viewing = await viewingSchedulerService.scheduleViewing(
        leadId,
        lead.property,
        scheduledDate,
        {
            scheduledBy: req.user._id,
            duration,
            viewingType,
            isAIGenerated: isAIGenerated || false
        }
    );

    res.status(201).json({
        success: true,
        data: viewing,
        message: 'Viewing scheduled successfully'
    });
});

// @desc    Get all viewings for a lead
// @route   GET /api/sales-automation/viewings/:leadId
// @access  Private
exports.getLeadViewings = asyncHandler(async (req, res) => {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this lead'
        });
    }

    const viewings = await Viewing.find({ lead: leadId })
        .populate('property')
        .sort({ scheduledDate: -1 });

    res.status(200).json({
        success: true,
        data: viewings
    });
});

// @desc    Confirm viewing attendance
// @route   POST /api/sales-automation/confirm-viewing/:viewingId
// @access  Public (lead can confirm via email link)
exports.confirmViewing = asyncHandler(async (req, res) => {
    const { viewingId } = req.params;
    const { role } = req.body; // 'lead' or 'agent'

    const viewing = await viewingSchedulerService.confirmViewing(viewingId, role || 'lead');

    res.status(200).json({
        success: true,
        data: viewing,
        message: 'Viewing confirmed successfully'
    });
});

// @desc    Complete viewing and record outcome
// @route   POST /api/sales-automation/complete-viewing/:viewingId
// @access  Private
exports.completeViewing = asyncHandler(async (req, res) => {
    const { viewingId } = req.params;
    const { interested, feedback, nextSteps, readyToNegotiate } = req.body;

    const viewing = await Viewing.findById(viewingId).populate('lead');
    if (!viewing) {
        return res.status(404).json({
            success: false,
            message: 'Viewing not found'
        });
    }

    const lead = viewing.lead;

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this viewing'
        });
    }

    const outcome = {
        interested: interested || false,
        feedback: feedback || '',
        nextSteps: nextSteps || '',
        readyToNegotiate: readyToNegotiate || false
    };

    const completedViewing = await viewingSchedulerService.completeViewing(viewingId, outcome);

    res.status(200).json({
        success: true,
        data: completedViewing,
        message: 'Viewing marked as completed'
    });
});

// @desc    Manually close deal (won/lost/disqualified)
// @route   POST /api/sales-automation/close-deal/:leadId
// @access  Private
exports.closeDeal = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const { outcome, finalPrice, reasonLost, reasonDisqualified, revenue, commission } = req.body;

    if (!outcome || !['won', 'lost', 'disqualified'].includes(outcome)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid outcome (won, lost, or disqualified)'
        });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to manage this lead'
        });
    }

    // Update lead
    lead.salesFunnelStage = outcome;
    lead.dealClosure = {
        outcome,
        finalPrice,
        closedAt: new Date(),
        closedBy: 'manual',
        reasonLost,
        reasonDisqualified,
        revenue,
        commission
    };
    lead.closedAt = new Date();

    // Add to stage history
    lead.stageHistory.push({
        stage: outcome,
        changedAt: new Date(),
        changedBy: 'manual',
        notes: `Deal closed as ${outcome}`
    });

    await lead.save();

    res.status(200).json({
        success: true,
        data: lead,
        message: `Deal marked as ${outcome}`
    });
});

// @desc    Get lead negotiation history
// @route   GET /api/sales-automation/negotiation/:leadId
// @access  Private
exports.getNegotiationHistory = asyncHandler(async (req, res) => {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId).populate('property');
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this lead'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            negotiation: lead.negotiation,
            property: {
                title: lead.property.title,
                listPrice: lead.property.price,
                currency: lead.property.currency
            }
        }
    });
});

// @desc    Get AI engagement history for a lead
// @route   GET /api/sales-automation/ai-engagement/:leadId
// @access  Private
exports.getAIEngagement = asyncHandler(async (req, res) => {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this lead'
        });
    }

    res.status(200).json({
        success: true,
        data: lead.aiEngagement
    });
});

// @desc    Get stage history for a lead
// @route   GET /api/sales-automation/stage-history/:leadId
// @access  Private
exports.getStageHistory = asyncHandler(async (req, res) => {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    // Check ownership
    if (lead.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this lead'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            currentStage: lead.salesFunnelStage,
            history: lead.stageHistory
        }
    });
});
