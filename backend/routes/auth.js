const express = require('express');
const { register, login, getMe, verifyAccount, setupAccount, forgotPassword, resetPassword } = require('../controllers/auth');
const { googleSignIn } = require('../controllers/googleAuth');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { check } = require('express-validator');

const router = express.Router();

router.post(
    '/register',
    authLimiter, // Rate limit registration attempts
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail().normalizeEmail(),
        check('password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character').isLength({ min: 8 }),
    ],
    register
);

router.post('/verify', authLimiter, verifyAccount); // Rate limit verification attempts

router.post(
    '/login',
    authLimiter, // Rate limit login attempts to prevent brute force
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    login
);

router.get('/me', protect, getMe);

router.put('/setup', protect, setupAccount);

// Google Sign-In
router.post('/google', googleSignIn);

// Forgot Password - Very strict rate limiting
router.post('/forgot-password', passwordResetLimiter, forgotPassword);

// Reset Password
router.post('/reset-password', authLimiter, resetPassword);


module.exports = router;