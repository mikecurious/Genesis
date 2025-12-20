const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Authenticate user with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleSignIn = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({
            success: false,
            message: 'Google credential is required'
        });
    }

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
        } else {
            // Create new user with Google auth
            user = await User.create({
                name,
                email,
                googleId,
                authProvider: 'google',
                isVerified: true, // Google users are pre-verified
                notificationPreferences: {
                    email: true, // Auto-subscribe to email notifications
                    whatsapp: false,
                    push: true,
                },
                role: 'Tenant', // Default role for buyers/searchers
            });

            // Send welcome email (optional - can be done asynchronously)
            // const emailService = require('../services/emailService');
            // emailService.sendWelcomeEmail(user.email, user.name);
        }

        // Generate JWT token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                notificationPreferences: user.notificationPreferences,
            },
        });
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid Google token',
        });
    }
});
