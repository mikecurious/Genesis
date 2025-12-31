
const express = require('express');
const {
    getRequests,
    createRequest,
    updateRequestStatus,
    getAIAnalysis,
    assignTechnician
} = require('../controllers/maintenance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getRequests)
    .post(authorize('Tenant'), createRequest);

router.route('/:id')
    .put(authorize('Property Seller', 'Landlord', 'Agent', 'Admin'), updateRequestStatus);

router.route('/:id/analysis')
    .get(getAIAnalysis);

router.route('/:id/assign-technician')
    .put(authorize('Property Seller', 'Landlord', 'Agent', 'Admin'), assignTechnician);

module.exports = router;
