const express = require('express');
const {
    createSurveyRequest,
    getUserSurveyRequests,
    getSurveyRequest,
} = require('../controllers/surveyor');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Survey Request Routes (for agents/buyers)
router.route('/')
    .post(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), createSurveyRequest)
    .get(protect, getUserSurveyRequests);

router.route('/:id')
    .get(protect, getSurveyRequest);

module.exports = router;
