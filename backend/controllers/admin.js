const User = require('../models/User');
const Notification = require('../models/Notification');
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

