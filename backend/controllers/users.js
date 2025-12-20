const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get tenants for the logged-in landlord
// @route   GET /api/users/tenants
// @access  Private (Landlord/Owner/Admin)
exports.getTenants = asyncHandler(async (req, res, next) => {
    const tenants = await User.find({ landlordId: req.user._id, role: 'Tenant' });
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
});

// @desc    Invite a new tenant
// @route   POST /api/users/invite-tenant
// @access  Private (Landlord/Owner/Admin)
exports.inviteTenant = asyncHandler(async (req, res, next) => {
    const { name, email, phone, unit } = req.body;

    if (!name || !email || !unit) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and unit for the tenant' });
    }

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // For simulation, we'll create a user with a default password.
    // In a real app, you'd send an invite link to set a password.
    const defaultPassword = 'password123';

    user = await User.create({
        name,
        email,
        phone,
        unit,
        password: defaultPassword,
        role: 'Tenant',
        isVerified: true, // Auto-verify invited tenants for simplicity
        landlordId: req.user._id, // Link tenant to the landlord creating them
        rentStatus: 'Due',
    });

    console.log(`--- TENANT INVITED ---`);
    console.log(`User: ${email}`);
    console.log(`Landlord: ${req.user.email}`);
    console.log(`Default Password: ${defaultPassword}`);
    console.log(`--------------------`);

    // We don't send the user object back with the password.
    const userResponse = await User.findById(user._id);

    res.status(201).json({ success: true, message: 'Tenant invited successfully.', data: userResponse });
});
