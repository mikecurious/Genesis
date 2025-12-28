
const express = require('express');
const rateLimit = require('express-rate-limit');
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

// Rate limiter for public lead submission (prevent spam/DoS)
// Allow 5 leads per 15 minutes per IP address
const leadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 requests per window
    message: {
        success: false,
        message: 'Too many lead submissions from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Public route - client submits lead (with rate limiting)
router.post('/', leadLimiter, createLead);

// Protected routes
router.get('/', protect, getLeads);
router.get('/stats', protect, getLeadStats);
router.get('/:id', protect, getLeadById);
router.put('/:id', protect, updateLead);
router.delete('/:id', protect, deleteLead);

module.exports = router;
