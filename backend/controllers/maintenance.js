
const MaintenanceRequest = require('../models/MaintenanceRequest');
const User = require('../models/User');
const maintenanceAIService = require('../services/maintenanceAIService');
const twilioService = require('../services/twilioService');
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
        .populate('tenant', 'name email phone')
        .populate('property', 'title location')
        .populate('landlord', 'name email phone');

    // Send notification to landlord (if specified)
    if (populatedRequest.landlord && populatedRequest.landlord.phone) {
        try {
            const landlord = populatedRequest.landlord;
            const tenant = populatedRequest.tenant;
            const propertyInfo = populatedRequest.property
                ? `Property: ${populatedRequest.property.title} (${populatedRequest.property.location})`
                : 'Property not specified';

            const message = `🔧 New Maintenance Request\n\nFrom: ${tenant.name}\n${propertyInfo}\n\nIssue: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n\nReview and assign a technician.`;

            await twilioService.sendSMS({
                to: landlord.phone,
                message: message
            });

            console.log(`📧 Maintenance request notification sent to landlord ${landlord.phone}`);
        } catch (notificationError) {
            console.error('Failed to send landlord notification:', notificationError);
        }
    }

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

    const oldStatus = request.status;

    request = await MaintenanceRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    ).populate('tenant', 'name email phone')
     .populate('property', 'title location');

    // Send notification to tenant about status change
    if (request.tenant && request.tenant.phone && oldStatus !== status) {
        try {
            const statusEmoji = {
                'Pending': '⏳',
                'In Progress': '🔧',
                'Completed': '✅',
                'Cancelled': '❌'
            };

            const propertyInfo = request.property
                ? ` for ${request.property.title}`
                : '';

            const message = `${statusEmoji[status] || '📋'} Maintenance Update\n\nYour maintenance request${propertyInfo} is now: ${status}\n\n${status === 'Completed' ? 'Issue has been resolved! Thank you for your patience.' : 'We\'ll keep you updated on progress.'}\n\nMyGF AI`;

            await twilioService.sendSMS({
                to: request.tenant.phone,
                message: message
            });

            console.log(`📧 Status update notification sent to tenant ${request.tenant.phone}`);
        } catch (notificationError) {
            console.error('Failed to send tenant notification:', notificationError);
        }
    }

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
        .populate('tenant', 'name email phone')
        .populate('property', 'title location')
        .populate('assignedTechnician', 'name email phone specialty');

    // Send notification to technician
    if (updatedRequest.assignedTechnician && updatedRequest.assignedTechnician.phone) {
        try {
            const technician = updatedRequest.assignedTechnician;
            const tenant = updatedRequest.tenant;
            const property = updatedRequest.property;

            const technicianMessage = `🔧 New Job Assignment\n\n${property ? `Property: ${property.title}\nLocation: ${property.location}` : 'Property details pending'}\n\nIssue: ${request.description.substring(0, 150)}${request.description.length > 150 ? '...' : ''}\n\nClient: ${tenant.name}\nContact: ${tenant.phone || tenant.email}\n\nPriority: ${request.aiAnalysis?.priority || 'Normal'}\n\nPlease review and contact the client.`;

            await twilioService.sendSMS({
                to: technician.phone,
                message: technicianMessage
            });

            console.log(`📧 Job assignment notification sent to technician ${technician.phone}`);
        } catch (notificationError) {
            console.error('Failed to send technician notification:', notificationError);
        }
    }

    // Send notification to tenant
    if (updatedRequest.tenant && updatedRequest.tenant.phone) {
        try {
            const technician = updatedRequest.assignedTechnician;
            const tenantMessage = `✅ Technician Assigned\n\nYour maintenance request is now being handled!\n\nTechnician: ${technician ? technician.name : 'Assigned'}\n${technician && technician.specialty ? `Specialty: ${technician.specialty}` : ''}\n\nThey will contact you shortly to schedule a visit.\n\nMyGF AI`;

            await twilioService.sendSMS({
                to: updatedRequest.tenant.phone,
                message: tenantMessage
            });

            console.log(`📧 Technician assignment notification sent to tenant ${updatedRequest.tenant.phone}`);
        } catch (notificationError) {
            console.error('Failed to send tenant notification:', notificationError);
        }
    }

    res.status(200).json({ success: true, data: updatedRequest });
});
