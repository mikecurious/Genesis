const axios = require('axios');

/**
 * Lightweight Africa's Talking client for SMS, Voice, and (optionally) WhatsApp.
 * Requires:
 *  - AFRICASTALKING_API_KEY
 *  - AFRICASTALKING_USERNAME (use "sandbox" for sandbox)
 * Optional:
 *  - AFRICASTALKING_SMS_FROM (sender ID/shortcode)
 *  - AFRICASTALKING_VOICE_FROM (voice-enabled number)
 *  - AFRICASTALKING_BASE_URL (override API base)
 */
class AfricasTalkingService {
    constructor() {
        this.username = process.env.AFRICASTALKING_USERNAME;
        this.apiKey = process.env.AFRICASTALKING_API_KEY;
        this.smsFrom = process.env.AFRICASTALKING_SMS_FROM;
        this.voiceFrom = process.env.AFRICASTALKING_VOICE_FROM;

        // Choose sandbox or production endpoints
        const isSandbox = (this.username || '').toLowerCase() === 'sandbox';
        const base = process.env.AFRICASTALKING_BASE_URL
            || (isSandbox ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com');
        const voiceBase = isSandbox ? 'https://voice.sandbox.africastalking.com' : 'https://voice.africastalking.com';

        this.http = axios.create({
            baseURL: base,
            headers: {
                apiKey: this.apiKey || '',
                Accept: 'application/json',
            },
        });

        this.voiceHttp = axios.create({
            baseURL: voiceBase,
            headers: {
                apiKey: this.apiKey || '',
                Accept: 'application/json',
            },
        });
    }

    isConfigured() {
        return Boolean(this.username && this.apiKey);
    }

    /**
     * Send SMS to one or more recipients (comma-separated or array).
     */
    async sendSms({ to, message, from, enqueue = 0 }) {
        if (!this.isConfigured()) {
            throw new Error('Africa\'s Talking not configured (missing API key/username)');
        }
        if (!to || !message) {
            throw new Error('Missing "to" or "message" for SMS');
        }
        const recipients = Array.isArray(to) ? to.join(',') : to;
        const payload = new URLSearchParams({
            username: this.username,
            to: recipients,
            message,
            enqueue: String(enqueue),
        });
        if (from || this.smsFrom) payload.append('from', from || this.smsFrom);

        const { data } = await this.http.post('/version1/messaging', payload);
        return data;
    }

    /**
     * Initiate a voice call.
     */
    async makeVoiceCall({ to, from }) {
        if (!this.isConfigured()) {
            throw new Error('Africa\'s Talking not configured (missing API key/username)');
        }
        if (!to) throw new Error('Missing "to" for voice call');
        const payload = new URLSearchParams({
            username: this.username,
            to,
            from: from || this.voiceFrom || '',
        });
        const { data } = await this.voiceHttp.post('/call', payload);
        return data;
    }

    /**
     * Placeholder for WhatsApp via AT's channels.
     * If you have a WhatsApp channel configured, supply the "from" address and template/text details.
     */
    async sendWhatsApp({ to, message, from }) {
        if (!this.isConfigured()) {
            throw new Error('Africa\'s Talking not configured (missing API key/username)');
        }
        if (!to || !message) {
            throw new Error('Missing "to" or "message" for WhatsApp');
        }
        // Many deployments use channel-based endpoints; adjust once channel details are provided.
        throw new Error('WhatsApp sending not configured. Provide channel/from details and endpoint before enabling.');
    }

    /**
     * Simple readiness check.
     */
    health() {
        return {
            configured: this.isConfigured(),
            smsFrom: this.smsFrom || null,
            voiceFrom: this.voiceFrom || null,
            username: this.username || null,
        };
    }
}

module.exports = new AfricasTalkingService();
