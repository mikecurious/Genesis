
const express = require('express');
const { getRequests, createRequest, updateRequestStatus } = require('../controllers/maintenance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getRequests)
    .post(authorize('Tenant'), createRequest);

router.route('/:id')
    .put(authorize('Property Seller', 'Landlord', 'Agent', 'Admin'), updateRequestStatus);

module.exports = router;
