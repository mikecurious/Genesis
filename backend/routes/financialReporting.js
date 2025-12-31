const express = require('express');
const {
    generateReport,
    getReports,
    getReport,
    exportReport,
    getDashboardSummary,
    updateStatus
} = require('../controllers/financialReporting');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(protect);
router.use(authorize('Landlord', 'Agent', 'Admin', 'Property Seller'));

router.route('/')
    .get(getReports)
    .post(generateReport);

router.route('/dashboard/summary')
    .get(getDashboardSummary);

router.route('/:id')
    .get(getReport);

router.route('/:id/export')
    .get(exportReport);

router.route('/:id/status')
    .put(updateStatus);

module.exports = router;
