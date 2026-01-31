const express = require('express');
const router = express.Router();
const {
    chatSearch,
    getPropertyWithAI,
    getGreeting,
    getContext,
    clearContext,
    processMessage,
    tenantManagement
} = require('../controllers/aiChat');
const { protect, optionalProtect } = require('../middleware/auth');
const { checkAISearchLimit } = require('../middleware/usageLimits');

// Public routes with usage limits
// Note: optionalProtect allows both authenticated and unauthenticated users
router.post('/search', optionalProtect, checkAISearchLimit, chatSearch);
router.post('/message', optionalProtect, checkAISearchLimit, processMessage);
router.post('/tenant-management', tenantManagement);
router.get('/greeting', getGreeting);
router.get('/property/:id', getPropertyWithAI);

// Protected routes (require authentication)
router.get('/context', protect, getContext);
router.delete('/context', protect, clearContext);

module.exports = router;
