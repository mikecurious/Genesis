const crypto = require('crypto');

/**
 * Middleware to verify M-Pesa callback authenticity
 * Implements multiple security layers:
 * 1. Secret token verification in callback URL
 * 2. IP whitelisting for Safaricom servers
 * 3. Request signature validation (if available)
 */

// Safaricom M-Pesa known IP ranges (update as needed)
const MPESA_IPS = [
    '196.201.214.200',
    '196.201.214.206',
    '196.201.213.114',
    '196.201.214.207',
    '196.201.214.208',
    '196.201.213.44',
    '196.201.212.127',
    '196.201.212.128',
    '196.201.212.129',
    '196.201.212.136',
    '196.201.212.138',
    // Add production IPs here
];

/**
 * Extract client IP from request (handles proxies)
 */
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress;
};

/**
 * Verify callback token in query parameters
 */
const verifyCallbackToken = (req, res, next) => {
    const expectedToken = process.env.MPESA_CALLBACK_TOKEN;

    // Skip verification if no token configured (development mode)
    if (!expectedToken) {
        console.warn('⚠️  MPESA_CALLBACK_TOKEN not configured - callback verification disabled');
        return next();
    }

    const receivedToken = req.query.token || req.body.token;

    if (receivedToken !== expectedToken) {
        console.error('❌ Invalid M-Pesa callback token');
        return res.status(403).json({
            ResultCode: 1,
            ResultDesc: 'Unauthorized'
        });
    }

    next();
};

/**
 * Verify callback IP is from Safaricom
 */
const verifyCallbackIp = (req, res, next) => {
    // Skip IP verification in development
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Development mode - IP verification skipped');
        return next();
    }

    const clientIp = getClientIp(req);

    if (!MPESA_IPS.includes(clientIp)) {
        console.error(`❌ Unauthorized IP attempting M-Pesa callback: ${clientIp}`);
        return res.status(403).json({
            ResultCode: 1,
            ResultDesc: 'Unauthorized IP'
        });
    }

    console.log(`✅ M-Pesa callback from authorized IP: ${clientIp}`);
    next();
};

/**
 * Verify callback data structure
 */
const verifyCallbackStructure = (req, res, next) => {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
        console.error('❌ Invalid M-Pesa callback structure');
        return res.status(400).json({
            ResultCode: 1,
            ResultDesc: 'Invalid callback structure'
        });
    }

    const { CheckoutRequestID, ResultCode } = Body.stkCallback;

    if (!CheckoutRequestID || ResultCode === undefined) {
        console.error('❌ Missing required callback fields');
        return res.status(400).json({
            ResultCode: 1,
            ResultDesc: 'Missing required fields'
        });
    }

    next();
};

/**
 * Combined M-Pesa callback verification middleware
 */
const verifyMpesaCallback = [
    verifyCallbackToken,
    verifyCallbackIp,
    verifyCallbackStructure
];

module.exports = {
    verifyMpesaCallback,
    verifyCallbackToken,
    verifyCallbackIp,
    verifyCallbackStructure
};
