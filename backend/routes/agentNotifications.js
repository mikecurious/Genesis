const express = require('express');
const {
    getNotificationPreferences,
    updateNotificationPreferences,
    sendTestNotification,
    getNotificationHistory
} = require('../controllers/agentNotificationController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication and specific roles
router.use(protect);
router.use(authorize('Agent', 'Landlord', 'Property Seller'));

/**
 * @route   GET /api/agent-notifications/notification-preferences
 * @desc    Get agent's notification preferences
 * @access  Private
 */
router.get('/notification-preferences', getNotificationPreferences);

/**
 * @route   PUT /api/agent-notifications/notification-preferences
 * @desc    Update agent's notification preferences
 * @access  Private
 */
router.put('/notification-preferences', updateNotificationPreferences);

/**
 * @route   POST /api/agent-notifications/notification-preferences/test
 * @desc    Send test notification to all enabled channels
 * @access  Private
 */
router.post('/notification-preferences/test', sendTestNotification);

/**
 * @route   GET /api/agent-notifications/notification-history
 * @desc    Get notification delivery history for analytics
 * @access  Private
 */
router.get('/notification-history', getNotificationHistory);

module.exports = router;
