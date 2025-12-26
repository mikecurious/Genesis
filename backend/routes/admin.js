const express = require('express');
const {
    getUsers,
    sendAnnouncement,
    createSurveyor,
    getAnalytics,
    getAllProperties,
    getAllLeads,
    updateUser,
    deleteUser
} = require('../controllers/admin');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// All routes in this file are protected and restricted to Admins
router.use(protect);
router.use(authorize('Admin'));

// Analytics & Dashboard
router.get('/analytics', getAnalytics);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Property & Lead Management
router.get('/properties', getAllProperties);
router.get('/leads', getAllLeads);

// System Operations
router.post('/announcements', sendAnnouncement);
router.post('/create-surveyor', createSurveyor);

module.exports = router;
