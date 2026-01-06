const express = require('express');
const {
    getProviders,
    getProvider,
    createProvider,
    updateProvider,
    deleteProvider,
    addReview,
    updateAvailability,
    getProviderStats
} = require('../controllers/serviceProvider');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Stats route
router.get('/stats', protect, getProviderStats);

// Main CRUD routes
router.route('/')
    .get(protect, getProviders)
    .post(protect, authorize('Agent', 'Admin', 'Landlord', 'Property Owner'), createProvider);

router.route('/:id')
    .get(protect, getProvider)
    .put(protect, updateProvider)
    .delete(protect, deleteProvider);

// Additional routes
router.post('/:id/reviews', protect, addReview);
router.patch('/:id/availability', protect, updateAvailability);

module.exports = router;
