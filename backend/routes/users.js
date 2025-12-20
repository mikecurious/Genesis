const express = require('express');
const { inviteTenant, getTenants } = require('../controllers/users');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Get all tenants for the logged-in landlord/owner
router.get(
    '/tenants',
    protect,
    authorize('Property Owner', 'Landlord', 'Agent & Owner', 'Admin'),
    getTenants
);

// Invite a new tenant (creates a user account for them)
router.post(
    '/invite-tenant', 
    protect, 
    authorize('Property Owner', 'Landlord', 'Agent & Owner', 'Admin'), 
    inviteTenant
);

module.exports = router;
