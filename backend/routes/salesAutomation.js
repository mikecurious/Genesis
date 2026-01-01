const express = require('express');
const {
    progressLead,
    getSalesPipeline,
    handleOffer,
    setNegotiationRules,
    toggleAINegotiation,
    getViewingSlots,
    scheduleViewing,
    getLeadViewings,
    confirmViewing,
    completeViewing,
    closeDeal,
    getNegotiationHistory,
    getAIEngagement,
    getStageHistory
} = require('../controllers/salesAutomation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Sales Pipeline
router.get('/pipeline', protect, getSalesPipeline);

// Lead Progression
router.post('/progress/:leadId', protect, progressLead);
router.get('/stage-history/:leadId', protect, getStageHistory);

// Viewing Management
router.get('/viewing-slots/:leadId', protect, getViewingSlots);
router.post('/schedule-viewing/:leadId', protect, scheduleViewing);
router.get('/viewings/:leadId', protect, getLeadViewings);
router.post('/confirm-viewing/:viewingId', confirmViewing); // Public - leads can confirm via email
router.post('/complete-viewing/:viewingId', protect, completeViewing);

// Negotiation
router.post('/offer/:leadId', protect, handleOffer);
router.put('/negotiation-rules/:leadId', protect, setNegotiationRules);
router.patch('/ai-negotiation/:leadId', protect, toggleAINegotiation);
router.get('/negotiation/:leadId', protect, getNegotiationHistory);

// Deal Closure
router.post('/close-deal/:leadId', protect, closeDeal);

// AI Engagement
router.get('/ai-engagement/:leadId', protect, getAIEngagement);

module.exports = router;
