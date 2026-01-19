const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const agentNotificationService = require('../services/agentNotificationService');

/**
 * @desc    Get agent notification preferences
 * @route   GET /api/agent-notifications/notification-preferences
 * @access  Private (Agent, Landlord, Property Seller)
 */
exports.getNotificationPreferences = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Return preferences with defaults if not set
    const preferences = user.agentProfile?.notificationPreferences || getDefaultPreferences();

    res.status(200).json({
        success: true,
        data: preferences
    });
});

/**
 * @desc    Update agent notification preferences
 * @route   PUT /api/agent-notifications/notification-preferences
 * @access  Private (Agent, Landlord, Property Seller)
 */
exports.updateNotificationPreferences = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const { channels, interactionTypes, rateLimits } = req.body;

    // Validate phone numbers if provided
    if (channels?.sms?.phoneNumber) {
        if (!isValidPhoneNumber(channels.sms.phoneNumber)) {
            return next(new ErrorResponse('Invalid SMS phone number format', 400));
        }
    }

    if (channels?.whatsapp?.phoneNumber) {
        if (!isValidPhoneNumber(channels.whatsapp.phoneNumber)) {
            return next(new ErrorResponse('Invalid WhatsApp phone number format', 400));
        }
    }

    // Validate email if provided
    if (channels?.email?.emailAddress) {
        if (!isValidEmail(channels.email.emailAddress)) {
            return next(new ErrorResponse('Invalid email address format', 400));
        }
    }

    // Initialize agentProfile if it doesn't exist
    if (!user.agentProfile) {
        user.agentProfile = {};
    }

    // Update preferences
    user.agentProfile.notificationPreferences = {
        channels: channels || user.agentProfile.notificationPreferences?.channels || getDefaultPreferences().channels,
        interactionTypes: interactionTypes || user.agentProfile.notificationPreferences?.interactionTypes || getDefaultPreferences().interactionTypes,
        rateLimits: rateLimits || user.agentProfile.notificationPreferences?.rateLimits || getDefaultPreferences().rateLimits
    };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.agentProfile.notificationPreferences,
        message: 'Notification preferences updated successfully'
    });
});

/**
 * @desc    Send test notification to agent
 * @route   POST /api/agent-notifications/notification-preferences/test
 * @access  Private (Agent, Landlord, Property Seller)
 */
exports.sendTestNotification = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Send test notification via all enabled channels
    const results = await agentNotificationService.sendTestNotification(user._id);

    if (!results.success) {
        return next(new ErrorResponse('Failed to send test notifications', 500));
    }

    res.status(200).json({
        success: true,
        data: results.results,
        message: 'Test notifications sent successfully'
    });
});

/**
 * @desc    Get notification history for agent
 * @route   GET /api/agent-notifications/notification-history
 * @access  Private (Agent, Landlord, Property Seller)
 */
exports.getNotificationHistory = asyncHandler(async (req, res, next) => {
    // TODO: Implement notification history tracking
    // This would require a separate NotificationLog model to store delivery history
    // For now, return a placeholder response

    const { page = 1, limit = 20, channel, startDate, endDate } = req.query;

    res.status(200).json({
        success: true,
        data: {
            notifications: [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                pages: 0
            }
        },
        message: 'Notification history tracking will be implemented in a future update'
    });
});

/**
 * Helper function: Get default notification preferences
 */
function getDefaultPreferences() {
    return {
        channels: {
            sms: {
                enabled: true,
                phoneNumber: null
            },
            whatsapp: {
                enabled: true,
                phoneNumber: null
            },
            email: {
                enabled: true,
                emailAddress: null
            },
            inApp: {
                enabled: true
            }
        },
        interactionTypes: {
            leadCaptured: {
                enabled: true,
                priority: 'high',
                channels: ['whatsapp', 'inApp']
            },
            emailInquiry: {
                enabled: true,
                priority: 'high',
                channels: ['email', 'inApp']
            },
            highScoreLead: {
                enabled: true,
                priority: 'urgent',
                scoreThreshold: 75,
                channels: ['sms', 'whatsapp', 'inApp']
            }
        },
        rateLimits: {
            sms: {
                maxPerHour: 10,
                maxPerDay: 50
            },
            whatsapp: {
                maxPerHour: 20,
                maxPerDay: 100
            }
        }
    };
}

/**
 * Helper function: Validate phone number
 */
function isValidPhoneNumber(phone) {
    // Basic international phone number validation
    return /^\+?[1-9]\d{1,14}$/.test(phone);
}

/**
 * Helper function: Validate email
 */
function isValidEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}
