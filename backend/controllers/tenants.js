const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');
const crypto = require('crypto');

// @desc    Get all tenants (Admin only)
// @route   GET /api/tenants
// @access  Private (Admin)
exports.getAllTenants = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { role: 'Tenant' };

    // Filter by landlord if provided
    if (req.query.landlordId) {
        filter.landlordId = req.query.landlordId;
    }

    // Filter by property if provided
    if (req.query.propertyId) {
        filter.propertyId = req.query.propertyId;
    }

    // Filter by rent status
    if (req.query.rentStatus) {
        filter.rentStatus = req.query.rentStatus;
    }

    const tenants = await User.find(filter)
        .populate('landlordId', 'name email phone')
        .populate('propertyId', 'title location price')
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: tenants.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: tenants
    });
});

// @desc    Get tenants for a specific landlord/agent
// @route   GET /api/tenants/my-tenants
// @access  Private (Landlord/Agent)
exports.getMyTenants = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find properties owned by this user (landlord or agent)
    const properties = await Property.find({ createdBy: userId });
    const propertyIds = properties.map(p => p._id);

    // Find tenants in these properties
    const tenants = await User.find({
        role: 'Tenant',
        $or: [
            { landlordId: userId },
            { propertyId: { $in: propertyIds } }
        ]
    })
        .populate('propertyId', 'title location price currency')
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
        total: tenants.length,
        paid: tenants.filter(t => t.rentStatus === 'Paid').length,
        due: tenants.filter(t => t.rentStatus === 'Due').length,
        overdue: tenants.filter(t => t.rentStatus === 'Overdue').length,
        totalRentExpected: tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
    };

    res.status(200).json({
        success: true,
        count: tenants.length,
        stats,
        data: tenants
    });
});

// @desc    Get tenants for a specific property
// @route   GET /api/tenants/property/:propertyId
// @access  Private
exports.getTenantsByProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Check if user has access to this property
    if (req.user.role !== 'Admin' && property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this property'
        });
    }

    const tenants = await User.find({
        role: 'Tenant',
        propertyId: propertyId
    })
        .populate('landlordId', 'name email phone')
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ unit: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        property: {
            id: property._id,
            title: property.title,
            location: property.location
        },
        count: tenants.length,
        data: tenants
    });
});

// @desc    Add tenant to property
// @route   POST /api/tenants/add
// @access  Private (Landlord/Agent/Admin)
exports.addTenantToProperty = asyncHandler(async (req, res) => {
    const {
        propertyId,
        name,
        email,
        phone,
        unit,
        rentAmount,
        depositAmount,
        leaseStartDate,
        leaseEndDate,
        whatsappNumber
    } = req.body;

    // Validate required fields
    if (!propertyId || !name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Please provide propertyId, name, email, and phone'
        });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Check if user owns this property (unless admin)
    if (req.user.role !== 'Admin' && property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to add tenants to this property'
        });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        // If user exists and is already a tenant of this property
        if (existingUser.role === 'Tenant' && existingUser.propertyId?.toString() === propertyId) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered as a tenant for this property'
            });
        }

        // If user exists but different role or property, update to add tenant role
        if (existingUser.role !== 'Tenant') {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered with a different role. Please use a different email.'
            });
        }
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Calculate next payment due (1 month from lease start or today)
    const startDate = leaseStartDate ? new Date(leaseStartDate) : new Date();
    const nextPaymentDue = new Date(startDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);

    // Create tenant user
    const tenant = await User.create({
        name,
        email,
        phone,
        password: tempPassword,
        role: 'Tenant',
        landlordId: req.user._id,
        propertyId,
        unit,
        rentAmount,
        depositAmount,
        leaseStartDate: startDate,
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
        rentStatus: 'Due',
        nextPaymentDue,
        whatsappNumber: whatsappNumber || phone,
        isVerified: false
    });

    // Send welcome email with login credentials
    try {
        const emailService = require('../services/emailService');
        await emailService.sendTenantWelcomeEmail(tenant, tempPassword, property);
    } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue even if email fails
    }

    res.status(201).json({
        success: true,
        message: 'Tenant added successfully. Welcome email sent with login credentials.',
        data: {
            id: tenant._id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            unit: tenant.unit,
            rentAmount: tenant.rentAmount,
            property: {
                id: property._id,
                title: property.title,
                location: property.location
            },
            tempPassword: tempPassword // Send once for reference
        }
    });
});

// @desc    Get single tenant details
// @route   GET /api/tenants/:id
// @access  Private
exports.getTenant = asyncHandler(async (req, res) => {
    const tenant = await User.findById(req.params.id)
        .populate('landlordId', 'name email phone')
        .populate('propertyId', 'title location price currency')
        .select('-password -verificationToken -resetPasswordToken');

    if (!tenant || tenant.role !== 'Tenant') {
        return res.status(404).json({
            success: false,
            message: 'Tenant not found'
        });
    }

    // Check authorization
    if (req.user.role !== 'Admin' &&
        tenant.landlordId?.toString() !== req.user._id.toString() &&
        tenant._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this tenant'
        });
    }

    res.status(200).json({
        success: true,
        data: tenant
    });
});

// @desc    Update tenant information
// @route   PUT /api/tenants/:id
// @access  Private (Landlord/Admin)
exports.updateTenant = asyncHandler(async (req, res) => {
    let tenant = await User.findById(req.params.id);

    if (!tenant || tenant.role !== 'Tenant') {
        return res.status(404).json({
            success: false,
            message: 'Tenant not found'
        });
    }

    // Check authorization
    if (req.user.role !== 'Admin' && tenant.landlordId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this tenant'
        });
    }

    // Fields that can be updated
    const allowedUpdates = [
        'name',
        'phone',
        'unit',
        'rentAmount',
        'depositAmount',
        'leaseStartDate',
        'leaseEndDate',
        'rentStatus',
        'whatsappNumber',
        'lastPaymentDate',
        'nextPaymentDue'
    ];

    // Update only allowed fields
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            tenant[field] = req.body[field];
        }
    });

    await tenant.save();

    res.status(200).json({
        success: true,
        message: 'Tenant updated successfully',
        data: tenant
    });
});

// @desc    Delete/Remove tenant
// @route   DELETE /api/tenants/:id
// @access  Private (Landlord/Admin)
exports.deleteTenant = asyncHandler(async (req, res) => {
    const tenant = await User.findById(req.params.id);

    if (!tenant || tenant.role !== 'Tenant') {
        return res.status(404).json({
            success: false,
            message: 'Tenant not found'
        });
    }

    // Check authorization
    if (req.user.role !== 'Admin' && tenant.landlordId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this tenant'
        });
    }

    // Instead of deleting, we'll remove property assignment
    tenant.propertyId = null;
    tenant.landlordId = null;
    tenant.unit = null;
    tenant.rentStatus = 'Paid'; // Clear status
    tenant.accountStatus = 'deactivated';

    await tenant.save();

    res.status(200).json({
        success: true,
        message: 'Tenant removed from property successfully'
    });
});

// @desc    Mark rent as paid
// @route   PUT /api/tenants/:id/mark-paid
// @access  Private (Landlord/Admin)
exports.markRentPaid = asyncHandler(async (req, res) => {
    const tenant = await User.findById(req.params.id);

    if (!tenant || tenant.role !== 'Tenant') {
        return res.status(404).json({
            success: false,
            message: 'Tenant not found'
        });
    }

    // Check authorization
    if (req.user.role !== 'Admin' && tenant.landlordId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this tenant'
        });
    }

    // Update payment status
    tenant.rentStatus = 'Paid';
    tenant.lastPaymentDate = new Date();

    // Calculate next payment due
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    tenant.nextPaymentDue = nextDue;

    await tenant.save();

    res.status(200).json({
        success: true,
        message: 'Rent marked as paid successfully',
        data: {
            rentStatus: tenant.rentStatus,
            lastPaymentDate: tenant.lastPaymentDate,
            nextPaymentDue: tenant.nextPaymentDue
        }
    });
});

// @desc    Get tenant statistics (for dashboard)
// @route   GET /api/tenants/stats/overview
// @access  Private (Landlord/Agent/Admin)
exports.getTenantStats = asyncHandler(async (req, res) => {
    let filter = { role: 'Tenant' };

    // If not admin, filter by landlord
    if (req.user.role !== 'Admin') {
        const properties = await Property.find({ createdBy: req.user._id });
        const propertyIds = properties.map(p => p._id);

        filter = {
            role: 'Tenant',
            $or: [
                { landlordId: req.user._id },
                { propertyId: { $in: propertyIds } }
            ]
        };
    }

    const tenants = await User.find(filter);

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.accountStatus === 'active').length,
        paid: tenants.filter(t => t.rentStatus === 'Paid').length,
        due: tenants.filter(t => t.rentStatus === 'Due').length,
        overdue: tenants.filter(t => t.rentStatus === 'Overdue').length,
        totalRentExpected: tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0),
        totalRentCollected: tenants
            .filter(t => t.rentStatus === 'Paid')
            .reduce((sum, t) => sum + (t.rentAmount || 0), 0),
        collectionRate: 0
    };

    // Calculate collection rate
    if (stats.totalRentExpected > 0) {
        stats.collectionRate = ((stats.totalRentCollected / stats.totalRentExpected) * 100).toFixed(2);
    }

    res.status(200).json({
        success: true,
        data: stats
    });
});
