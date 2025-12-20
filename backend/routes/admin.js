const express = require('express');
const { getUsers, sendAnnouncement, createSurveyor } = require('../controllers/admin');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// All routes in this file are protected and restricted to Admins
router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.post('/announcements', sendAnnouncement);
router.post('/create-surveyor', createSurveyor);

module.exports = router;
