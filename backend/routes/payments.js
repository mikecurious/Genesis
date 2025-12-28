const express = require('express');
const {
    initiatePayment,
    mpesaCallback,
    queryPaymentStatus,
    getPaymentHistory,
    initiateGenericPayment,
    getPaymentMethods
} = require('../controllers/payments');
const { protect } = require('../middleware/auth');
const { verifyMpesaCallback } = require('../middleware/mpesaVerification');

const router = express.Router();

// Payment methods (public)
router.get('/methods', getPaymentMethods);

// Payment initiation routes
router.post('/initiate', protect, initiatePayment); // Subscription payment
router.post('/pay', protect, initiateGenericPayment); // Generic payment

// Payment query routes
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId/status', protect, queryPaymentStatus);

// Webhook route for M-Pesa to send callback data (public)
// Protected by signature verification, IP whitelisting, and structure validation
router.post('/mpesa-callback', verifyMpesaCallback, mpesaCallback);

module.exports = router;
