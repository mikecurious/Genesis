const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getOverview,
    getLeadAnalytics,
    getPropertyAnalytics,
    getTrends
} = require('../controllers/analytics');

// All routes are protected
router.use(protect);

// Analytics routes
router.get('/overview', getOverview);
router.get('/leads', getLeadAnalytics);
router.get('/properties', getPropertyAnalytics);
router.get('/trends', getTrends);

module.exports = router;
