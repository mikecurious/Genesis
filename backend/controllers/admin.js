const User = require('../models/User');
const Notification = require('../models/Notification');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Send an announcement to all users
// @route   POST /api/admin/announcements
// @access  Private (Admin)
exports.sendAnnouncement = asyncHandler(async (req, res, next) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // In a real app, this should be a background job for large user bases
    const users = await User.find({ role: { $ne: 'Admin' } });
    const notifications = users.map(user => ({
        user: user._id,
        type: 'announcement',
        message: message,
    }));

    await Notification.insertMany(notifications);

    // Here you could also trigger a push notification via Socket.io or another service.

    res.status(200).json({ success: true, message: 'Announcement sent to all users.' });
});

// @desc    Create a surveyor account
// @route   POST /api/admin/create-surveyor
// @access  Private (Admin)
exports.createSurveyor = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required'
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
        });
    }

    // Create surveyor user
    const surveyor = await User.create({
        name,
        email,
        password, // Will be hashed by User model pre-save hook
        phone: phone || '',
        role: 'Surveyor',
        subscription: {
            plan: 'Free', // Surveyors don't need paid plans
            status: 'active',
        },
    });

    res.status(201).json({
        success: true,
        message: 'Surveyor account created successfully',
        data: {
            id: surveyor._id,
            name: surveyor.name,
            email: surveyor.email,
            role: surveyor.role,
        }
    });
});

// @desc    Get system analytics for admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = asyncHandler(async (req, res, next) => {
    // User statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeSubscriptions = await User.countDocuments({ 'subscription.status': 'active' });

    // Property statistics
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: 'active' });
    const propertiesByType = await Property.aggregate([
        { $group: { _id: '$propertyType', count: { $sum: 1 } } }
    ]);
    const boostedProperties = await Property.countDocuments({ boosted: true });

    // Lead statistics
    const totalLeads = await Lead.countDocuments();
    const leadsByStatus = await Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const leadsByDealType = await Lead.aggregate([
        { $group: { _id: '$dealType', count: { $sum: 1 } } }
    ]);

    // Recent activity
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role createdAt isVerified');

    const recentProperties = await Property.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('createdBy', 'name email')
        .select('title location price createdAt status');

    const recentLeads = await Lead.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('property', 'title location')
        .select('client.name client.email dealType status createdAt');

    // Revenue statistics (mock for now - integrate with payment system later)
    const subscriptionRevenue = {
        basic: await User.countDocuments({ 'subscription.plan': 'Basic' }) * 10,
        mygf13: await User.countDocuments({ 'subscription.plan': 'MyGF 1.3' }) * 30,
        mygf32: await User.countDocuments({ 'subscription.plan': 'MyGF 3.2' }) * 50,
    };
    const totalRevenue = subscriptionRevenue.basic + subscriptionRevenue.mygf13 + subscriptionRevenue.mygf32;

    res.status(200).json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                verified: verifiedUsers,
                byRole: usersByRole,
                activeSubscriptions,
                recent: recentUsers
            },
            properties: {
                total: totalProperties,
                active: activeProperties,
                boosted: boostedProperties,
                byType: propertiesByType,
                recent: recentProperties
            },
            leads: {
                total: totalLeads,
                byStatus: leadsByStatus,
                byDealType: leadsByDealType,
                recent: recentLeads
            },
            revenue: {
                total: totalRevenue,
                breakdown: subscriptionRevenue
            }
        }
    });
});

// @desc    Get all properties for admin
// @route   GET /api/admin/properties
// @access  Private (Admin)
exports.getAllProperties = asyncHandler(async (req, res, next) => {
    const properties = await Property.find()
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: properties.length,
        data: properties
    });
});

// @desc    Get all leads for admin
// @route   GET /api/admin/leads
// @access  Private (Admin)
exports.getAllLeads = asyncHandler(async (req, res, next) => {
    const leads = await Lead.find()
        .populate('property', 'title location price')
        .populate('propertyOwner', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
    });
});

// @desc    Update user status (verify, suspend, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Update user
    Object.keys(updates).forEach(key => {
        if (key !== 'password' && key !== '_id') {
            user[key] = updates[key];
        }
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Don't allow deleting admin accounts
    if (user.role === 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Cannot delete admin accounts'
        });
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});

// @desc    Suspend user account
// @route   POST /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.suspendUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Don't allow suspending admin accounts
    if (user.role === 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Cannot suspend admin accounts'
        });
    }

    // Check if already suspended
    if (user.accountStatus === 'suspended') {
        return res.status(400).json({
            success: false,
            message: 'User is already suspended'
        });
    }

    user.accountStatus = 'suspended';
    user.suspendedAt = new Date();
    user.suspensionReason = reason || 'Suspended by admin';
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            accountStatus: user.accountStatus,
            suspensionReason: user.suspensionReason
        }
    });
});

// @desc    Reactivate suspended user account
// @route   POST /api/admin/users/:id/reactivate
// @access  Private (Admin)
exports.reactivateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    user.accountStatus = 'active';
    user.suspendedAt = null;
    user.suspensionReason = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User reactivated successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            accountStatus: user.accountStatus
        }
    });
});

// @desc    Moderate property (approve, reject, flag)
// @route   POST /api/admin/properties/:id/moderate
// @access  Private (Admin)
exports.moderateProperty = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { action, note } = req.body; // action: 'approve', 'reject', 'flag'

    if (!['approve', 'reject', 'flag'].includes(action)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid action. Must be approve, reject, or flag'
        });
    }

    const property = await Property.findById(id).populate('createdBy', 'name email');
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    const statusMap = {
        'approve': 'approved',
        'reject': 'rejected',
        'flag': 'flagged'
    };

    property.moderationStatus = statusMap[action];
    property.moderatedBy = req.user.id;
    property.moderatedAt = new Date();
    property.moderationNote = note || null;

    // If rejected, also set status to inactive
    if (action === 'reject') {
        property.status = 'sold'; // Using 'sold' as inactive placeholder
    }

    await property.save();

    res.status(200).json({
        success: true,
        message: `Property ${action}ed successfully`,
        data: {
            id: property._id,
            title: property.title,
            moderationStatus: property.moderationStatus,
            moderationNote: property.moderationNote,
            owner: property.createdBy
        }
    });
});

// @desc    Delete property
// @route   DELETE /api/admin/properties/:id
// @access  Private (Admin)
exports.deleteProperty = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    await property.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Property deleted successfully'
    });
});

// @desc    Get system activity logs (recent actions)
// @route   GET /api/admin/activity
// @access  Private (Admin)
exports.getActivityLogs = asyncHandler(async (req, res, next) => {
    // Get recent moderated properties
    const recentModerations = await Property.find({ moderatedBy: { $ne: null } })
        .sort({ moderatedAt: -1 })
        .limit(20)
        .populate('moderatedBy', 'name email')
        .populate('createdBy', 'name email')
        .select('title moderationStatus moderatedAt moderationNote');

    // Get recent suspended users
    const recentSuspensions = await User.find({ accountStatus: 'suspended' })
        .sort({ suspendedAt: -1 })
        .limit(20)
        .select('name email accountStatus suspendedAt suspensionReason');

    res.status(200).json({
        success: true,
        data: {
            moderations: recentModerations,
            suspensions: recentSuspensions
        }
    });
});

