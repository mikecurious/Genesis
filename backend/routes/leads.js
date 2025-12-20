
const express = require('express');
const router = express.Router();
const {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead,
    getLeadStats
} = require('../controllers/leads');
const { protect } = require('../middleware/auth');

// Public route - client submits lead
router.post('/', createLead);

// Protected routes
router.get('/', protect, getLeads);
router.get('/stats', protect, getLeadStats);
router.get('/:id', protect, getLeadById);
router.put('/:id', protect, updateLead);
router.delete('/:id', protect, deleteLead);

module.exports = router;
