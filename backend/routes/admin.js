const express = require('express');
const {
    getUsers,
    sendAnnouncement,
    createSurveyor,
    getAnalytics,
    getAllProperties,
    getAllLeads,
    updateUser,
    deleteUser,
    verifyUser,
    suspendUser,
    reactivateUser,
    moderateProperty,
    deleteProperty,
    getActivityLogs
} = require('../controllers/admin');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// All routes in this file are protected and restricted to Admins
router.use(protect);
router.use(authorize('Admin'));

// Analytics & Dashboard
router.get('/analytics', getAnalytics);
router.get('/activity', getActivityLogs);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/verify', verifyUser);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/reactivate', reactivateUser);

// Property & Lead Management
router.get('/properties', getAllProperties);
router.get('/leads', getAllLeads);
router.post('/properties/:id/moderate', moderateProperty);
router.delete('/properties/:id', deleteProperty);

// System Operations
router.post('/announcements', sendAnnouncement);
router.post('/create-surveyor', createSurveyor);

module.exports = router;
