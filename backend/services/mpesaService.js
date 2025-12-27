const axios = require('axios');

class MpesaService {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
        this.passkey = process.env.MPESA_PASSKEY;
        this.callbackURL = process.env.MPESA_CALLBACK_URL;
        this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

        this.baseURL = this.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get OAuth access token from Safaricom
     */
    async getAccessToken() {
        try {
            // Return cached token if still valid
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

            const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                },
            });

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
     */
    generatePassword() {
        const timestamp = this.getTimestamp();
        const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
        return { password, timestamp };
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
     * Initiate STK Push
     * @param {string} phoneNumber - Phone number in format 254XXXXXXXXX
     * @param {number} amount - Amount to charge
     * @param {string} accountReference - Account reference (e.g., user ID, invoice number)
     * @param {string} transactionDesc - Transaction description
     */
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc = 'Payment') {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();

            const payload = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(amount), // Must be integer
                PartyA: phoneNumber, // Customer phone number
                PartyB: this.businessShortCode, // Same as BusinessShortCode
                PhoneNumber: phoneNumber, // Customer phone number
                CallBackURL: this.callbackURL,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
            };

            console.log('STK Push Request:', { ...payload, Password: '***' });

            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
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
     */
    async querySTKPush(checkoutRequestID) {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();

            const payload = {
                BusinessShortCode: this.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID,
            };

            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpushquery/v1/query`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
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
