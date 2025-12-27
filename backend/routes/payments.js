const express = require('express');
const {
    initiatePayment,
    mpesaCallback,
    queryPaymentStatus,
    getPaymentHistory,
    initiateGenericPayment
} = require('../controllers/payments');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Payment initiation routes
router.post('/initiate', protect, initiatePayment); // Subscription payment
router.post('/pay', protect, initiateGenericPayment); // Generic payment

// Payment query routes
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId/status', protect, queryPaymentStatus);

// Webhook route for M-Pesa to send callback data (public)
router.post('/mpesa-callback', mpesaCallback);

module.exports = router;
