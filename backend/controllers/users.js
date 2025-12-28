const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

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

    // Generate a secure random password
    const randomPassword = crypto.randomBytes(4).toString('hex') + 'Aa1!'; // Ensures complexity requirements

    user = await User.create({
        name,
        email,
        phone,
        unit,
        password: randomPassword,
        role: 'Tenant',
        isVerified: true, // Auto-verify invited tenants for simplicity
        landlordId: req.user._id, // Link tenant to the landlord creating them
        rentStatus: 'Due',
    });

    console.log(`Tenant invited: ${email} by ${req.user.email}`);

    // Send welcome email with temporary password
    try {
        const transporter = require('../config/email');
        await transporter.sendMail({
            from: `"Genesis Real Estate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Genesis - Your Tenant Account',
            html: `
                <h2>Welcome to Genesis Real Estate Platform!</h2>
                <p>Hi ${name},</p>
                <p>You have been added as a tenant by your landlord.</p>
                <p><strong>Your login credentials:</strong></p>
                <p>Email: ${email}</p>
                <p>Temporary Password: <code>${randomPassword}</code></p>
                <p><strong>Please change your password after logging in.</strong></p>
                <p>Unit: ${unit}</p>
                <br>
                <p>Best regards,<br>Genesis Real Estate Team</p>
            `
        });
        console.log(`Welcome email sent to ${email} with temporary password`);
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError.message);
        // Continue even if email fails - password was still created
    }

    // We don't send the user object back with the password.
    const userResponse = await User.findById(user._id);

    res.status(201).json({ success: true, message: 'Tenant invited successfully.', data: userResponse });
});
