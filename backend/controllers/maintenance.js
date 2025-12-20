
const MaintenanceRequest = require('../models/MaintenanceRequest');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all maintenance requests for the logged-in user (tenant or landlord)
// @route   GET /api/maintenance
// @access  Private
exports.getRequests = asyncHandler(async (req, res, next) => {
    let requests;
    if (req.user.role === 'Tenant') {
        requests = await MaintenanceRequest.find({ tenant: req.user._id }).populate('tenant', 'name');
    } else {
        // Landlords/Owners/Admins get all requests for this demo
        // In a real app, this would be filtered by properties they own
        requests = await MaintenanceRequest.find().populate('tenant', 'name');
    }
    res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Create a new maintenance request
// @route   POST /api/maintenance
// @access  Private (Tenant only)
exports.createRequest = asyncHandler(async (req, res, next) => {
    const { description } = req.body;
    const request = await MaintenanceRequest.create({
        description,
        tenant: req.user._id,
    });
    // Populate tenant name for the response
    const populatedRequest = await MaintenanceRequest.findById(request._id).populate('tenant', 'name');
    res.status(201).json({ success: true, data: populatedRequest });
});

// @desc    Update a maintenance request status
// @route   PUT /api/maintenance/:id
// @access  Private (Landlord/Owner/Admin)
exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    let request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request = await MaintenanceRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    ).populate('tenant', 'name');

    res.status(200).json({ success: true, data: request });
});
