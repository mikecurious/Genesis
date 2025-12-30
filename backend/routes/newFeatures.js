const express = require('express');
const router = express.Router();
const {
    getHighPriorityLeads,
    updateLeadScore,
    getScoredLeads,
    triggerRentReminders,
    updateRentReminderSettings,
    generateFinancialReport,
    exportFinancialReport,
    requestSurveyor,
    attachSurveyor,
    getPropertySurveyor,
    updateSurveyStatus,
    getFeatureFlags,
    updateFeatureFlags
} = require('../controllers/newFeatures');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication
router.use(protect);

// ===== LEAD SCORING ROUTES =====
router.get('/leads/high-priority', getHighPriorityLeads);
router.post('/leads/:id/score', updateLeadScore);
router.get('/leads/scored', getScoredLeads);

// ===== RENT REMINDER ROUTES =====
router.post('/rent-reminders/trigger', authorize('Landlord', 'Admin'), triggerRentReminders);
router.put('/rent-reminders/settings', authorize('Landlord', 'Admin'), updateRentReminderSettings);

// ===== FINANCIAL REPORTING ROUTES =====
router.post('/reports/generate', generateFinancialReport);
router.post('/reports/export', exportFinancialReport);

// ===== SURVEYOR REQUEST ROUTES =====
router.post('/surveyor/request', requestSurveyor);
router.post('/surveyor/attach', attachSurveyor);
router.get('/surveyor/property/:propertyId', getPropertySurveyor);
router.put('/surveyor/status/:propertyId', authorize('Surveyor', 'Admin'), updateSurveyStatus);

// ===== FEATURE FLAGS ROUTES =====
router.get('/flags', getFeatureFlags);
router.put('/flags', updateFeatureFlags);

module.exports = router;
