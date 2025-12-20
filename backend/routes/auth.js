const express = require('express');
const { register, login, getMe, verifyAccount, setupAccount, forgotPassword, resetPassword } = require('../controllers/auth');
const { googleSignIn } = require('../controllers/googleAuth');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

const router = express.Router();

router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    ],
    register
);

router.post('/verify', verifyAccount);

router.post(
    '/login',
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

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.post('/reset-password', resetPassword);


module.exports = router;