const express = require('express');
const router = express.Router();
const {
    chatSearch,
    getPropertyWithAI,
    getGreeting,
    getContext,
    clearContext,
    processMessage
} = require('../controllers/aiChat');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/search', chatSearch);
router.post('/message', processMessage);
router.get('/greeting', getGreeting);
router.get('/property/:id', getPropertyWithAI);

// Protected routes (require authentication)
router.get('/context', protect, getContext);
router.delete('/context', protect, clearContext);

module.exports = router;
