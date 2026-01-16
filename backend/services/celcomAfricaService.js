const axios = require('axios');

/**
 * Celcom Africa SMS Service
 *
 * Required Environment Variables:
 * - CELCOM_AFRICA_API_KEY
 * - CELCOM_AFRICA_PARTNER_ID
 * - CELCOM_AFRICA_SHORTCODE
 *
 * Optional Environment Variables:
 * - CELCOM_AFRICA_SMS_ENDPOINT (default: https://isms.celcomafrica.com/api/services/sendsms/)
 * - CELCOM_AFRICA_BALANCE_ENDPOINT (default: https://isms.celcomafrica.com/api/services/getbalance/)
 * - CELCOM_AFRICA_DLR_ENDPOINT (default: https://isms.celcomafrica.com/api/services/getdlr/)
 *
 * API Documentation: https://celcomafrica.com/developers-center
 */

class CelcomAfricaService {
    constructor() {
        this.apiKey = process.env.CELCOM_AFRICA_API_KEY;
        this.partnerID = process.env.CELCOM_AFRICA_PARTNER_ID;
        this.shortcode = process.env.CELCOM_AFRICA_SHORTCODE || 'GENESIS';

        this.smsEndpoint = process.env.CELCOM_AFRICA_SMS_ENDPOINT ||
            'https://isms.celcomafrica.com/api/services/sendsms/';
        this.balanceEndpoint = process.env.CELCOM_AFRICA_BALANCE_ENDPOINT ||
            'https://isms.celcomafrica.com/api/services/getbalance/';
        this.dlrEndpoint = process.env.CELCOM_AFRICA_DLR_ENDPOINT ||
            'https://isms.celcomafrica.com/api/services/getdlr/';

        this.isInitialized = false;
        this.initialize();
    }

    /**
     * Initialize service
     */
    initialize() {
        if (this.apiKey && this.partnerID) {
            this.isInitialized = true;
            console.log('✅ Celcom Africa service initialized');
        } else {
            console.warn('⚠️  Celcom Africa credentials not configured');
        }
    }

    /**
     * Check if service is configured
     */
    isConfigured() {
        return this.isInitialized && this.apiKey && this.partnerID;
    }

    /**
     * Format phone number to Kenyan format (254XXXXXXXXX)
     * Accepts: 0712345678, +254712345678, 254712345678, 712345678
     * Returns: 254712345678
     */
    formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return null;

        // Remove all non-numeric characters except +
        let cleaned = phoneNumber.replace(/[^\d+]/g, '');

        // Remove + if present
        cleaned = cleaned.replace('+', '');

        // Handle different formats
        if (cleaned.startsWith('254')) {
            // Already in correct format: 254XXXXXXXXX
            return cleaned;
        } else if (cleaned.startsWith('0')) {
            // Format: 0712345678 -> 254712345678
            return '254' + cleaned.substring(1);
        } else if (cleaned.length === 9) {
            // Format: 712345678 -> 254712345678
            return '254' + cleaned;
        } else {
            // Assume it's already in correct format or return as is
            return cleaned.startsWith('254') ? cleaned : '254' + cleaned;
        }
    }

    /**
     * Map Celcom error codes to user-friendly messages
     */
    getErrorMessage(code) {
        const errorMap = {
            200: 'Success',
            1001: 'Invalid API Key',
            1002: 'Invalid Partner ID',
            1003: 'Invalid mobile number',
            1004: 'Invalid message content',
            1005: 'Invalid shortcode',
            1006: 'Insufficient balance',
            1007: 'Missing required parameter',
            1008: 'Invalid timeToSend format',
            1009: 'Message too long',
            1010: 'Rate limit exceeded',
            4090: 'System error - Please try again later',
            4091: 'Database error',
            4092: 'Network error',
            4093: 'Service unavailable'
        };
        return errorMap[code] || `Unknown error (code: ${code})`;
    }

    /**
     * Send SMS to one or more recipients
     * @param {Object} params
     * @param {string|string[]} params.to - Phone number(s) to send to
     * @param {string} params.message - Message content (GSM7 characters)
     * @param {string} params.shortcode - Sender ID (optional, uses default if not provided)
     * @param {number} params.timeToSend - Unix timestamp for scheduled SMS (optional)
     * @returns {Promise<Object>} Response with success status
     */
    async sendSMS({ to, message, shortcode, timeToSend }) {
        if (!this.isConfigured()) {
            console.log('📱 SMS not sent: Celcom Africa not configured');
            return { success: false, error: 'Celcom Africa not configured' };
        }

        if (!to || !message) {
            return { success: false, error: 'Missing phone number or message' };
        }

        try {
            // Format phone numbers
            const phoneNumbers = Array.isArray(to) ? to : [to];
            const formattedNumbers = phoneNumbers.map(num => this.formatPhoneNumber(num)).filter(Boolean);

            if (formattedNumbers.length === 0) {
                return { success: false, error: 'No valid phone numbers provided' };
            }

            // Celcom accepts comma-separated numbers for bulk SMS
            const mobileNumbers = formattedNumbers.join(',');

            // URL encode the message
            const encodedMessage = encodeURIComponent(message);

            // Prepare payload
            const payload = {
                apikey: this.apiKey,
                partnerID: this.partnerID,
                message: encodedMessage,
                shortcode: shortcode || this.shortcode,
                mobile: mobileNumbers
            };

            // Add optional timeToSend parameter
            if (timeToSend) {
                payload.timeToSend = timeToSend;
            }

            // Send request
            const response = await axios.post(this.smsEndpoint, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 second timeout
            });

            // Parse response
            const responseData = response.data;

            // Celcom returns an array of responses
            if (responseData && responseData.responses && Array.isArray(responseData.responses)) {
                const results = responseData.responses;

                // Check if all messages were successful
                const allSuccess = results.every(r => r['response-code'] === 200);
                const messageIds = results.map(r => r.messageid);

                if (allSuccess) {
                    console.log(`✅ SMS sent to ${formattedNumbers.join(', ')} via Celcom Africa`);
                    return {
                        success: true,
                        recipients: formattedNumbers,
                        messageIds: messageIds,
                        channel: 'sms',
                        provider: 'celcomafrica',
                        response: results
                    };
                } else {
                    // Some messages failed
                    const failedResults = results.filter(r => r['response-code'] !== 200);
                    const errorCodes = failedResults.map(r => r['response-code']);
                    const errorMessages = errorCodes.map(code => this.getErrorMessage(code));

                    console.error(`❌ SMS send partially failed: ${errorMessages.join(', ')}`);
                    return {
                        success: false,
                        error: `Some messages failed: ${errorMessages.join(', ')}`,
                        channel: 'sms',
                        details: results
                    };
                }
            } else {
                console.error(`❌ SMS send failed: Invalid response format`);
                return {
                    success: false,
                    error: 'Invalid response format from Celcom',
                    channel: 'sms',
                    details: responseData
                };
            }
        } catch (error) {
            console.error(`❌ SMS send failed:`, error.message);

            // Extract error details
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Unknown error occurred';

            return {
                success: false,
                error: errorMessage,
                channel: 'sms',
                details: error.response?.data
            };
        }
    }

    /**
     * Get account balance
     * @returns {Promise<Object>} Balance information
     */
    async getBalance() {
        if (!this.isConfigured()) {
            return { success: false, error: 'Celcom Africa not configured' };
        }

        try {
            const payload = {
                apikey: this.apiKey,
                partnerID: this.partnerID
            };

            const response = await axios.post(this.balanceEndpoint, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ Balance retrieved from Celcom Africa');
            return {
                success: true,
                balance: response.data,
                provider: 'celcomafrica'
            };
        } catch (error) {
            console.error('❌ Balance retrieval failed:', error.message);
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Get delivery report for a message
     * @param {Object} params
     * @param {string|number} params.messageId - Message ID from send response
     * @returns {Promise<Object>} Delivery report
     */
    async getDeliveryReport({ messageId }) {
        if (!this.isConfigured()) {
            return { success: false, error: 'Celcom Africa not configured' };
        }

        if (!messageId) {
            return { success: false, error: 'Message ID is required' };
        }

        try {
            const payload = {
                apikey: this.apiKey,
                partnerID: this.partnerID,
                messageID: messageId
            };

            const response = await axios.post(this.dlrEndpoint, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log(`✅ Delivery report retrieved for message ${messageId}`);
            return {
                success: true,
                deliveryReport: response.data,
                provider: 'celcomafrica'
            };
        } catch (error) {
            console.error(`❌ Delivery report retrieval failed:`, error.message);
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Get service health status
     */
    getHealthStatus() {
        return {
            configured: this.isConfigured(),
            smsEndpoint: this.smsEndpoint,
            balanceEndpoint: this.balanceEndpoint,
            dlrEndpoint: this.dlrEndpoint,
            apiKeyConfigured: !!this.apiKey,
            partnerIDConfigured: !!this.partnerID,
            shortcode: this.shortcode
        };
    }
}

module.exports = new CelcomAfricaService();
