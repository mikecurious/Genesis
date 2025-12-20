const express = require('express');
const { initiatePayment, mpesaCallback } = require('../controllers/payments');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Route to start the payment process for the logged-in user
router.post('/initiate', protect, initiatePayment);

// Webhook route for M-Pesa to send callback data
router.post('/mpesa-callback', mpesaCallback);

module.exports = router;
