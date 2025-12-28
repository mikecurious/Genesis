const axios = require('axios');
const retry = require('async-retry');

class MpesaService {
    constructor() {
        // Required environment variables for basic M-Pesa functionality
        const required = [
            'MPESA_CONSUMER_KEY',
            'MPESA_CONSUMER_SECRET',
            'MPESA_CALLBACK_URL'
        ];

        const missing = required.filter(key => !process.env[key]);
        if (missing.length > 0) {
            console.error(`⚠️  M-Pesa configuration incomplete. Missing: ${missing.join(', ')}`);
            console.error('M-Pesa payment functionality will be disabled.');
            this.isConfigured = false;
            return;
        }

        // Basic configuration
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.callbackURL = process.env.MPESA_CALLBACK_URL;
        this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

        // Paybill configuration (for subscriptions, bills)
        this.paybillShortCode = process.env.MPESA_PAYBILL_SHORTCODE;
        this.paybillPasskey = process.env.MPESA_PAYBILL_PASSKEY;
        this.hasPaybill = !!(this.paybillShortCode && this.paybillPasskey);

        // Till Number configuration (for buy goods, retail)
        this.tillNumber = process.env.MPESA_TILL_NUMBER;
        this.tillPasskey = process.env.MPESA_TILL_PASSKEY;
        this.hasTill = !!(this.tillNumber && this.tillPasskey);

        // Backward compatibility: use MPESA_BUSINESS_SHORTCODE as paybill if paybill not set
        if (!this.hasPaybill && process.env.MPESA_BUSINESS_SHORTCODE && process.env.MPESA_PASSKEY) {
            this.paybillShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
            this.paybillPasskey = process.env.MPESA_PASSKEY;
            this.hasPaybill = true;
        }

        this.isConfigured = this.hasPaybill || this.hasTill;

        if (!this.isConfigured) {
            console.error('⚠️  No payment methods configured. Set either Paybill or Till Number credentials.');
            return;
        }

        this.baseURL = this.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        this.accessToken = null;
        this.tokenExpiry = null;

        console.log(`✓ M-Pesa service initialized (${this.environment} mode)`);
        console.log(`  Payment methods: ${this.hasPaybill ? 'Paybill' : ''}${this.hasPaybill && this.hasTill ? ' + ' : ''}${this.hasTill ? 'Till' : ''}`);
    }

    /**
     * Get OAuth access token from Safaricom
     * Implements retry logic with exponential backoff
     */
    async getAccessToken() {
        try {
            if (!this.isConfigured) {
                throw new Error('M-Pesa service is not configured. Please set required environment variables.');
            }

            // Return cached token if still valid
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

            // Retry with exponential backoff: 3 attempts, 1-5 second delays
            const response = await retry(
                async (bail) => {
                    try {
                        return await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
                            headers: {
                                'Authorization': `Basic ${auth}`,
                            },
                            timeout: 15000, // 15 second timeout
                        });
                    } catch (error) {
                        // Don't retry on 400-level errors (client errors)
                        if (error.response && error.response.status >= 400 && error.response.status < 500) {
                            bail(error);
                            return;
                        }
                        throw error;
                    }
                },
                {
                    retries: 3,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 5000,
                    onRetry: (error, attempt) => {
                        console.warn(`M-Pesa OAuth attempt ${attempt} failed, retrying...`);
                    }
                }
            );

            this.accessToken = response.data.access_token;
            // Tokens expire in 3600 seconds, cache for 3500 seconds to be safe
            this.tokenExpiry = Date.now() + (3500 * 1000);

            return this.accessToken;
        } catch (error) {
            console.error('M-Pesa OAuth Error:', error.response?.data || error.message);
            throw new Error('Failed to get M-Pesa access token');
        }
    }

    /**
     * Generate password for STK Push
     * @param {string} paymentMode - 'paybill' or 'till'
     */
    generatePassword(paymentMode = 'paybill') {
        const timestamp = this.getTimestamp();
        let shortCode, passkey;

        if (paymentMode === 'till') {
            shortCode = this.tillNumber;
            passkey = this.tillPasskey;
        } else {
            shortCode = this.paybillShortCode;
            passkey = this.paybillPasskey;
        }

        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        return { password, timestamp, shortCode };
    }

    /**
     * Get current timestamp in format YYYYMMDDHHmmss
     */
    getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    /**
     * Get available payment methods
     */
    getAvailablePaymentMethods() {
        const methods = [];
        if (this.hasPaybill) {
            methods.push({
                type: 'paybill',
                name: 'Paybill',
                shortCode: this.paybillShortCode,
                description: 'Best for subscriptions and bills'
            });
        }
        if (this.hasTill) {
            methods.push({
                type: 'till',
                name: 'Till Number (Buy Goods)',
                tillNumber: this.tillNumber,
                description: 'Best for retail purchases'
            });
        }
        return methods;
    }

    /**
     * Initiate STK Push
     * @param {string} phoneNumber - Phone number in format 254XXXXXXXXX
     * @param {number} amount - Amount to charge
     * @param {string} accountReference - Account reference (e.g., user ID, invoice number)
     * @param {string} transactionDesc - Transaction description
     * @param {string} paymentMode - 'paybill' or 'till' (default: 'paybill')
     */
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc = 'Payment', paymentMode = 'paybill') {
        try {
            if (!this.isConfigured) {
                return {
                    success: false,
                    error: 'M-Pesa service is not configured. Please set required environment variables.',
                };
            }

            // Validate payment mode
            if (paymentMode === 'paybill' && !this.hasPaybill) {
                return {
                    success: false,
                    error: 'Paybill payment mode is not configured. Please configure MPESA_PAYBILL_SHORTCODE and MPESA_PAYBILL_PASSKEY.',
                };
            }

            if (paymentMode === 'till' && !this.hasTill) {
                return {
                    success: false,
                    error: 'Till Number payment mode is not configured. Please configure MPESA_TILL_NUMBER and MPESA_TILL_PASSKEY.',
                };
            }

            const accessToken = await this.getAccessToken();
            const { password, timestamp, shortCode } = this.generatePassword(paymentMode);

            // Validate and round amount properly
            if (amount !== Math.floor(amount)) {
                console.warn(`Amount ${amount} has decimal places, rounding to ${Math.round(amount)}`);
            }

            // Select transaction type based on payment mode
            const transactionType = paymentMode === 'till'
                ? 'CustomerBuyGoodsOnline'  // For Till Number
                : 'CustomerPayBillOnline';   // For Paybill

            const payload = {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: transactionType,
                Amount: Math.round(amount), // Must be integer, use Math.round instead of Math.floor
                PartyA: phoneNumber, // Customer phone number
                PartyB: shortCode, // Paybill shortcode or Till number
                PhoneNumber: phoneNumber, // Customer phone number
                CallBackURL: this.callbackURL,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
            };

            console.log(`STK Push Request (${paymentMode}):`, { ...payload, Password: '***' });

            // Retry with exponential backoff: 3 attempts, 1-5 second delays
            const response = await retry(
                async (bail) => {
                    try {
                        return await axios.post(
                            `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
                            payload,
                            {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                },
                                timeout: 15000, // 15 second timeout
                            }
                        );
                    } catch (error) {
                        // Don't retry on 400-level errors (client errors)
                        if (error.response && error.response.status >= 400 && error.response.status < 500) {
                            bail(error);
                            return;
                        }
                        throw error;
                    }
                },
                {
                    retries: 3,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 5000,
                    onRetry: (error, attempt) => {
                        console.warn(`STK Push attempt ${attempt} failed, retrying...`);
                    }
                }
            );

            console.log('STK Push Response:', response.data);

            return {
                success: true,
                merchantRequestID: response.data.MerchantRequestID,
                checkoutRequestID: response.data.CheckoutRequestID,
                responseCode: response.data.ResponseCode,
                responseDescription: response.data.ResponseDescription,
                customerMessage: response.data.CustomerMessage,
            };
        } catch (error) {
            console.error('STK Push Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.errorMessage || error.message,
            };
        }
    }

    /**
     * Query STK Push transaction status
     * @param {string} checkoutRequestID - Checkout Request ID from STK Push
     * @param {string} paymentMode - 'paybill' or 'till' (default: 'paybill')
     */
    async querySTKPush(checkoutRequestID, paymentMode = 'paybill') {
        try {
            if (!this.isConfigured) {
                return {
                    success: false,
                    error: 'M-Pesa service is not configured. Please set required environment variables.',
                };
            }

            const accessToken = await this.getAccessToken();
            const { password, timestamp, shortCode } = this.generatePassword(paymentMode);

            const payload = {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID,
            };

            // Retry with exponential backoff: 3 attempts, 1-5 second delays
            const response = await retry(
                async (bail) => {
                    try {
                        return await axios.post(
                            `${this.baseURL}/mpesa/stkpushquery/v1/query`,
                            payload,
                            {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                },
                                timeout: 15000, // 15 second timeout
                            }
                        );
                    } catch (error) {
                        // Don't retry on 400-level errors (client errors)
                        if (error.response && error.response.status >= 400 && error.response.status < 500) {
                            bail(error);
                            return;
                        }
                        throw error;
                    }
                },
                {
                    retries: 3,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 5000,
                    onRetry: (error, attempt) => {
                        console.warn(`STK Query attempt ${attempt} failed, retrying...`);
                    }
                }
            );

            return {
                success: true,
                resultCode: response.data.ResultCode,
                resultDesc: response.data.ResultDesc,
                data: response.data,
            };
        } catch (error) {
            console.error('STK Query Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.errorMessage || error.message,
            };
        }
    }

    /**
     * Process M-Pesa callback data
     * @param {object} callbackData - Callback data from M-Pesa
     */
    processCallback(callbackData) {
        const { Body } = callbackData;
        const { stkCallback } = Body;

        const result = {
            merchantRequestID: stkCallback.MerchantRequestID,
            checkoutRequestID: stkCallback.CheckoutRequestID,
            resultCode: stkCallback.ResultCode,
            resultDesc: stkCallback.ResultDesc,
        };

        // If payment was successful (ResultCode = 0)
        if (stkCallback.ResultCode === 0) {
            const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

            result.mpesaReceiptNumber = this.extractCallbackValue(callbackMetadata, 'MpesaReceiptNumber');
            result.amount = this.extractCallbackValue(callbackMetadata, 'Amount');
            result.balance = this.extractCallbackValue(callbackMetadata, 'Balance');
            result.transactionDate = this.extractCallbackValue(callbackMetadata, 'TransactionDate');
            result.phoneNumber = this.extractCallbackValue(callbackMetadata, 'PhoneNumber');
        }

        return result;
    }

    /**
     * Extract value from callback metadata
     */
    extractCallbackValue(items, name) {
        const item = items.find(i => i.Name === name);
        return item ? item.Value : null;
    }
}

module.exports = new MpesaService();
