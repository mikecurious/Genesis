
const express = require('express');
const router = express.Router();
const { smartSearch, generateSemanticTags, updateEmbedding } = require('../controllers/smartQuery');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/smart-search', smartSearch);

// Protected routes
router.post('/:id/generate-tags', protect, generateSemanticTags);
router.post('/:id/update-embedding', protect, updateEmbedding);

module.exports = router;
