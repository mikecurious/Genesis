const express = require('express');
const {
    getAgentProfile,
    getAgentProfileById,
    updateAgentProfile,
    uploadProfileImage
} = require('../controllers/agentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// ==================== AGENT PROFILE MANAGEMENT ROUTES ====================

// Profile Management (Agent, Landlord, Property Seller)
router.route('/profile')
    .get(protect, authorize('Agent', 'Landlord', 'Property Seller'), getAgentProfile)
    .put(protect, authorize('Agent', 'Landlord', 'Property Seller'), updateAgentProfile);

// Profile image upload
router.route('/upload-image')
    .post(protect, authorize('Agent', 'Landlord', 'Property Seller'), ...uploadProfileImage);

// Public route to get agent profile by ID (for property detail pages)
router.route('/profile/:userId')
    .get(getAgentProfileById);

module.exports = router;
