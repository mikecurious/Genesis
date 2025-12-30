const express = require('express');
const router = express.Router();
const {
    getAllTenants,
    getMyTenants,
    getTenantsByProperty,
    addTenantToProperty,
    getTenant,
    updateTenant,
    deleteTenant,
    markRentPaid,
    getTenantStats
} = require('../controllers/tenants');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication
router.use(protect);

// Statistics endpoint
router.get('/stats/overview', authorize('Landlord', 'Agent', 'Admin'), getTenantStats);

// Get all tenants (Admin only)
router.get('/', authorize('Admin'), getAllTenants);

// Get my tenants (Landlord/Agent)
router.get('/my-tenants', authorize('Landlord', 'Agent', 'Admin'), getMyTenants);

// Get tenants by property
router.get('/property/:propertyId', getTenantsByProperty);

// Add tenant to property
router.post('/add', authorize('Landlord', 'Agent', 'Admin'), addTenantToProperty);

// Mark rent as paid
router.put('/:id/mark-paid', authorize('Landlord', 'Agent', 'Admin'), markRentPaid);

// Single tenant operations
router.route('/:id')
    .get(getTenant)
    .put(authorize('Landlord', 'Agent', 'Admin'), updateTenant)
    .delete(authorize('Landlord', 'Agent', 'Admin'), deleteTenant);

module.exports = router;
