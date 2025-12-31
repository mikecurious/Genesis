
const MaintenanceRequest = require('../models/MaintenanceRequest');
const User = require('../models/User');
const maintenanceAIService = require('../services/maintenanceAIService');
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
    const { description, images, property, landlord } = req.body;

    // Create maintenance request
    const requestData = {
        description,
        tenant: req.user._id,
    };

    // Add optional fields
    if (property) requestData.property = property;
    if (landlord) requestData.landlord = landlord;
    if (images && Array.isArray(images)) {
        requestData.images = images.map(img => ({
            url: img.url || img,
            uploadedAt: new Date()
        }));
    }

    const request = await MaintenanceRequest.create(requestData);

    // Run AI analysis asynchronously (don't wait for it)
    maintenanceAIService.analyzeMaintenanceRequest(request)
        .then(result => {
            console.log(`✅ AI analysis completed for maintenance request ${request._id}`);
        })
        .catch(error => {
            console.error(`❌ AI analysis failed for maintenance request ${request._id}:`, error);
        });

    // Populate tenant name for the response
    const populatedRequest = await MaintenanceRequest.findById(request._id)
        .populate('tenant', 'name email')
        .populate('property', 'title location')
        .populate('landlord', 'name email');

    res.status(201).json({
        success: true,
        data: populatedRequest,
        message: 'Maintenance request created. AI analysis in progress...'
    });
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

// @desc    Get AI analysis for a maintenance request
// @route   GET /api/maintenance/:id/analysis
// @access  Private
exports.getAIAnalysis = asyncHandler(async (req, res, next) => {
    const request = await MaintenanceRequest.findById(req.params.id)
        .populate('tenant', 'name email')
        .populate('property', 'title location')
        .populate('assignedTechnician');

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // If no AI analysis exists yet, trigger it
    if (!request.aiAnalysis || !request.aiAnalysis.analyzedAt) {
        const result = await maintenanceAIService.analyzeMaintenanceRequest(request);

        // Fetch updated request
        const updatedRequest = await MaintenanceRequest.findById(req.params.id)
            .populate('tenant', 'name email')
            .populate('property', 'title location')
            .populate('assignedTechnician');

        return res.status(200).json({
            success: true,
            data: {
                request: updatedRequest,
                analysis: updatedRequest.aiAnalysis,
                recommendedTechnicians: result.recommendedTechnicians
            }
        });
    }

    // Return existing analysis
    const technicians = await maintenanceAIService.findSuitableTechnicians(
        request.aiAnalysis.category
    );

    res.status(200).json({
        success: true,
        data: {
            request,
            analysis: request.aiAnalysis,
            recommendedTechnicians: technicians
        }
    });
});

// @desc    Assign technician to maintenance request
// @route   PUT /api/maintenance/:id/assign-technician
// @access  Private (Landlord/Owner/Admin)
exports.assignTechnician = asyncHandler(async (req, res, next) => {
    const { technicianId } = req.body;

    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.assignedTechnician = technicianId;
    request.status = 'In Progress';
    await request.save();

    const updatedRequest = await MaintenanceRequest.findById(req.params.id)
        .populate('tenant', 'name email')
        .populate('property', 'title location')
        .populate('assignedTechnician');

    res.status(200).json({ success: true, data: updatedRequest });
});
