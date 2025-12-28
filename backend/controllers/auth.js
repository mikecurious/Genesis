const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @desc    Register a new user (and start verification)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user but don't verify yet
    user = new User({ name, email, password, phone });

    const verificationToken = user.getVerificationToken();

    await user.save();

    // Send verification email
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Welcome to MyGF AI!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering. Please use the verification code below to verify your account:</p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px;">${verificationToken}</span>
                </div>
            </div>
            <p>This code will expire in 1 hour.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you didn't create an account, please ignore this email.
            </p>
        </div>
    `;

    // Send email with timeout to prevent hanging
    const sendEmailWithTimeout = async (emailOptions, timeoutMs = 15000) => {
        const sendEmail = require('../config/email');
        return Promise.race([
            sendEmail(emailOptions),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email timeout')), timeoutMs)
            )
        ]);
    };

    try {
        await sendEmailWithTimeout({
            email: user.email,
            subject: 'Verify Your Account - MyGF AI',
            html
        });

        console.log(`✅ Verification email sent to ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for a verification code.'
        });
    } catch (error) {
        console.error('Email sending error:', error.message);
        // Still allow registration even if email fails
        // SECURITY: Never expose OTP in response or logs

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for a verification code. If you did not receive the email, please contact support.'
        });
    }
});

// @desc    Verify user account
// @route   POST /api/auth/verify
// @access  Public
exports.verifyAccount = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    // Hash the incoming OTP to compare with the one in the DB
    const hashedToken = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    const user = await User.findOne({
        email,
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
        return res.status(401).json({ success: false, message: 'Account not verified. Please check your email.' });
    }

    // Check if account is suspended
    if (user.accountStatus === 'suspended') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been suspended.',
            reason: user.suspensionReason || 'Account suspended by administrator'
        });
    }

    // Check if account is deactivated
    if (user.accountStatus === 'deactivated') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.'
        });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Complete user setup (role & plan)
// @route   PUT /api/auth/setup
// @access  Private
exports.setupAccount = asyncHandler(async (req, res, next) => {
    const { role, plan } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    user.subscription.plan = plan;
    // In a real app, payment status would be pending until webhook confirmation
    user.subscription.status = 'active';
    user.subscription.expiresAt = new Date(new Date().setMonth(new Date().getMonth() + 1));

    await user.save();

    res.status(200).json({ success: true, data: user });
});


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        // For security, don't reveal if email exists or not
        return res.status(200).json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.'
        });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
        </div>
    `;

    // Send email with timeout to prevent hanging
    const sendEmailWithTimeout = async (emailOptions, timeoutMs = 15000) => {
        const sendEmail = require('../config/email');
        return Promise.race([
            sendEmail(emailOptions),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Email timeout')), timeoutMs)
            )
        ]);
    };

    try {
        await sendEmailWithTimeout({
            email: user.email,
            subject: 'Password Reset Request - MyGF AI',
            html
        });

        res.status(200).json({
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Email sending error:', error.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
            success: false,
            message: 'Email could not be sent. Please try again later.'
        });
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide token and new password'
        });
    }

    // Validate password strength
    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long'
        });
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
    }

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});


// Helper to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};