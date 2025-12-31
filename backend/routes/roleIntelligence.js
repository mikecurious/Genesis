const express = require('express');
const {
    analyzeRoles,
    getRoleIntelligence,
    setRole,
    enableAutoDetection
} = require('../controllers/roleIntelligence');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getRoleIntelligence);

router.route('/analyze')
    .get(analyzeRoles);

router.route('/set-role')
    .put(setRole);

router.route('/enable-auto')
    .put(enableAutoDetection);

module.exports = router;
