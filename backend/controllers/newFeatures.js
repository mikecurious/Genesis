const asyncHandler = require('express-async-handler');
const leadScoringService = require('../services/leadScoringService');
const rentReminderService = require('../services/rentReminderService');
const financialReportService = require('../services/financialReportService');
const aiChatService = require('../services/aiChatService');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const User = require('../models/User');
const path = require('path');

// ===== LEAD SCORING CONTROLLERS =====

// @desc    Get high-priority leads
// @route   GET /api/features/leads/high-priority
// @access  Private
exports.getHighPriorityLeads = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const leads = await leadScoringService.getHighPriorityLeads(req.user._id, limit);

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
    });
});

// @desc    Update lead score manually
// @route   POST /api/features/leads/:id/score
// @access  Private
exports.updateLeadScore = asyncHandler(async (req, res) => {
    const lead = await leadScoringService.scoreSpecificLead(req.params.id);

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Get all leads with scores
// @route   GET /api/features/leads/scored
// @access  Private
exports.getScoredLeads = asyncHandler(async (req, res) => {
    const leads = await Lead.find({
        createdBy: req.user._id,
        status: { $in: ['new', 'contacted', 'in-progress'] }
    })
        .populate('property', 'title location price')
        .sort({ score: -1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
    });
});

// ===== RENT REMINDER CONTROLLERS =====

// @desc    Trigger rent reminders manually
// @route   POST /api/features/rent-reminders/trigger
// @access  Private (Landlords only)
exports.triggerRentReminders = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Landlord') {
        return res.status(403).json({
            success: false,
            message: 'Only landlords can trigger rent reminders'
        });
    }

    const result = await rentReminderService.triggerRemindersForLandlord(req.user._id);

    res.status(200).json(result);
});

// @desc    Update rent reminder settings
// @route   PUT /api/features/rent-reminders/settings
// @access  Private (Landlords only)
exports.updateRentReminderSettings = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Landlord') {
        return res.status(403).json({
            success: false,
            message: 'Only landlords can update rent reminder settings'
        });
    }

    const { enabled, daysBeforeDue, channels } = req.body;

    const user = await User.findById(req.user._id);

    if (enabled !== undefined) {
        user.featureFlags.rentReminders.enabled = enabled;
    }
    if (daysBeforeDue) {
        user.featureFlags.rentReminders.daysBeforeDue = daysBeforeDue;
    }
    if (channels) {
        user.featureFlags.rentReminders.channels = {
            ...user.featureFlags.rentReminders.channels,
            ...channels
        };
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Rent reminder settings updated',
        data: user.featureFlags.rentReminders
    });
});

// ===== FINANCIAL REPORTING CONTROLLERS =====

// @desc    Generate financial report
// @route   POST /api/features/reports/generate
// @access  Private
exports.generateFinancialReport = asyncHandler(async (req, res) => {
    const { startDate, endDate, type } = req.body;

    let report;

    if (type === 'monthly') {
        report = await financialReportService.generateMonthlyReport(req.user._id);
    } else if (type === 'quarterly') {
        report = await financialReportService.generateQuarterlyReport(req.user._id);
    } else if (startDate && endDate) {
        report = await financialReportService.generateCustomReport(req.user._id, startDate, endDate);
    } else {
        return res.status(400).json({
            success: false,
            message: 'Please specify report type (monthly/quarterly) or provide startDate and endDate'
        });
    }

    res.status(200).json({
        success: true,
        data: report
    });
});

// @desc    Export financial report to Excel
// @route   POST /api/features/reports/export
// @access  Private
exports.exportFinancialReport = asyncHandler(async (req, res) => {
    const { startDate, endDate, type } = req.body;

    let report;

    if (type === 'monthly') {
        report = await financialReportService.generateMonthlyReport(req.user._id);
    } else if (type === 'quarterly') {
        report = await financialReportService.generateQuarterlyReport(req.user._id);
    } else if (startDate && endDate) {
        report = await financialReportService.generateCustomReport(req.user._id, startDate, endDate);
    } else {
        return res.status(400).json({
            success: false,
            message: 'Please specify report type (monthly/quarterly) or provide startDate and endDate'
        });
    }

    const exportResult = await financialReportService.exportToExcel(report);

    // Send file for download
    res.download(exportResult.filePath, exportResult.fileName, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).json({
                success: false,
                message: 'Error downloading report'
            });
        }
    });
});

// ===== SURVEYOR REQUEST CONTROLLERS =====

// @desc    Request surveyor via chat
// @route   POST /api/features/surveyor/request
// @access  Private
exports.requestSurveyor = asyncHandler(async (req, res) => {
    const { message, propertyId } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a message'
        });
    }

    const result = await aiChatService.processSurveyorRequest(
        message,
        req.user._id,
        propertyId || null
    );

    res.status(200).json(result);
});

// @desc    Attach surveyor to property
// @route   POST /api/features/surveyor/attach
// @access  Private
exports.attachSurveyor = asyncHandler(async (req, res) => {
    const { propertyId, surveyorId } = req.body;

    if (!propertyId || !surveyorId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide both propertyId and surveyorId'
        });
    }

    // Verify property belongs to user
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    if (property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You can only attach surveyors to your own properties'
        });
    }

    const result = await aiChatService.attachSurveyorToProperty(propertyId, surveyorId);

    res.status(200).json(result);
});

// @desc    Get attached surveyor for property
// @route   GET /api/features/surveyor/property/:propertyId
// @access  Private
exports.getPropertySurveyor = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.propertyId)
        .populate('attachedSurveyor', 'name email phone surveyorProfile');

    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    if (!property.attachedSurveyor) {
        return res.status(200).json({
            success: true,
            message: 'No surveyor attached to this property',
            data: null
        });
    }

    res.status(200).json({
        success: true,
        data: {
            surveyor: property.attachedSurveyor,
            attachedAt: property.surveyorAttachedAt,
            status: property.surveyStatus,
            notes: property.surveyorNotes
        }
    });
});

// @desc    Update survey status
// @route   PUT /api/features/surveyor/status/:propertyId
// @access  Private (Surveyor only)
exports.updateSurveyStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const property = await Property.findById(req.params.propertyId);

    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Verify user is the attached surveyor
    if (property.attachedSurveyor?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not the surveyor for this property'
        });
    }

    if (status) {
        property.surveyStatus = status;
        if (status === 'completed') {
            property.surveyCompletedAt = new Date();
        }
    }

    if (notes) {
        property.surveyorNotes = notes;
    }

    await property.save();

    res.status(200).json({
        success: true,
        message: 'Survey status updated',
        data: property
    });
});

// ===== FEATURE FLAGS CONTROLLERS =====

// @desc    Get user feature flags
// @route   GET /api/features/flags
// @access  Private
exports.getFeatureFlags = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: user.featureFlags
    });
});

// @desc    Update feature flags
// @route   PUT /api/features/flags
// @access  Private
exports.updateFeatureFlags = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const updates = req.body;

    // Update only the provided flags
    for (const [feature, settings] of Object.entries(updates)) {
        if (user.featureFlags[feature]) {
            user.featureFlags[feature] = {
                ...user.featureFlags[feature],
                ...settings
            };
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Feature flags updated',
        data: user.featureFlags
    });
});
