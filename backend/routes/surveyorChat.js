const express = require('express');
const {
    parseChatMessage,
    attachSurveyor,
    getRecommendations,
    getAttachedSurveyor,
    updateSurveyorStatus
} = require('../controllers/surveyorChat');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/surveyor-chat/parse
// @desc    Parse chat message for surveyor intent
// @access  Private
router.post('/parse', parseChatMessage);

// @route   POST /api/surveyor-chat/attach
// @desc    Attach surveyor to property
// @access  Private
router.post('/attach', attachSurveyor);

// @route   GET /api/surveyor-chat/recommend/:propertyId
// @desc    Get surveyor recommendations for a property
// @access  Private
router.get('/recommend/:propertyId', getRecommendations);

// @route   GET /api/surveyor-chat/attached/:propertyId
// @desc    Get attached surveyor for a property
// @access  Private
router.get('/attached/:propertyId', getAttachedSurveyor);

// @route   PATCH /api/surveyor-chat/status/:propertyId
// @desc    Update surveyor attachment status
// @access  Private
router.patch('/status/:propertyId', updateSurveyorStatus);

module.exports = router;
