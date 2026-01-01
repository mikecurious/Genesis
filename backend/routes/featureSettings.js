const express = require('express');
const {
    getSettings,
    updateSettings,
    resetSettings,
    getRecommendations,
    toggleFeature
} = require('../controllers/featureSettings');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSettings)
    .put(updateSettings);

router.route('/reset')
    .post(resetSettings);

router.route('/recommendations')
    .get(getRecommendations);

router.route('/:feature/toggle')
    .patch(toggleFeature);

module.exports = router;
