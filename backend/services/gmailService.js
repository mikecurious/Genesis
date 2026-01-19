const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Gmail Service
 * Handles Gmail API integration for reading inbound emails
 */
class GmailService {
    constructor() {
        this.gmail = null;
        this.auth = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Gmail API with OAuth2 credentials
     */
    async initialize() {
        try {
            // Check if credentials are provided via environment variables
            const clientId = process.env.GMAIL_CLIENT_ID;
            const clientSecret = process.env.GMAIL_CLIENT_SECRET;
            const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

            if (!clientId || !clientSecret || !refreshToken) {
                console.warn('Gmail API credentials not configured. Email inquiry tracking via Gmail will not work.');
                console.warn('Required env vars: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN');
                return false;
            }

            // Create OAuth2 client
            const oauth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                'http://localhost:3000/auth/gmail/callback' // Redirect URI (configured in Google Cloud Console)
            );

            // Set refresh token
            oauth2Client.setCredentials({
                refresh_token: refreshToken
            });

            this.auth = oauth2Client;
            this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            this.isInitialized = true;

            console.log('✅ Gmail API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Gmail API:', error);
            return false;
        }
    }

    /**
     * Watch for new emails using Gmail push notifications
     * @param {String} emailAddress - Email address to watch
     */
    async watchInbox(emailAddress = 'me') {
        try {
            if (!this.isInitialized) {
                throw new Error('Gmail API not initialized');
            }

            const topicName = process.env.GMAIL_PUBSUB_TOPIC;
            if (!topicName) {
                throw new Error('GMAIL_PUBSUB_TOPIC not configured');
            }

            const res = await this.gmail.users.watch({
                userId: emailAddress,
                requestBody: {
                    topicName: topicName,
                    labelIds: ['INBOX']
                }
            });

            console.log('✅ Gmail watch set up:', res.data);
            return res.data;
        } catch (error) {
            console.error('Failed to watch inbox:', error);
            throw error;
        }
    }

    /**
     * Get list of messages
     * @param {String} query - Gmail search query
     * @param {Number} maxResults - Maximum number of results
     */
    async listMessages(query = 'is:unread', maxResults = 10) {
        try {
            if (!this.isInitialized) {
                throw new Error('Gmail API not initialized');
            }

            const res = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: maxResults
            });

            return res.data.messages || [];
        } catch (error) {
            console.error('Failed to list messages:', error);
            throw error;
        }
    }

    /**
     * Get full message details
     * @param {String} messageId - Gmail message ID
     */
    async getMessage(messageId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Gmail API not initialized');
            }

            const res = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            return res.data;
        } catch (error) {
            console.error('Failed to get message:', error);
            throw error;
        }
    }

    /**
     * Parse Gmail message to extract relevant information
     * @param {Object} message - Gmail message object
     */
    parseMessage(message) {
        try {
            const headers = message.payload.headers;
            const parsed = {
                id: message.id,
                threadId: message.threadId,
                from: this.getHeader(headers, 'From'),
                to: this.getHeader(headers, 'To'),
                subject: this.getHeader(headers, 'Subject'),
                date: this.getHeader(headers, 'Date'),
                text: '',
                html: ''
            };

            // Extract body content
            if (message.payload.parts) {
                // Multipart message
                for (const part of message.payload.parts) {
                    if (part.mimeType === 'text/plain' && part.body.data) {
                        parsed.text = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    } else if (part.mimeType === 'text/html' && part.body.data) {
                        parsed.html = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }
            } else if (message.payload.body && message.payload.body.data) {
                // Single part message
                const bodyData = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
                if (message.payload.mimeType === 'text/html') {
                    parsed.html = bodyData;
                } else {
                    parsed.text = bodyData;
                }
            }

            return parsed;
        } catch (error) {
            console.error('Failed to parse message:', error);
            throw error;
        }
    }

    /**
     * Get header value from headers array
     * @param {Array} headers - Array of header objects
     * @param {String} name - Header name to find
     */
    getHeader(headers, name) {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : null;
    }

    /**
     * Mark message as read
     * @param {String} messageId - Gmail message ID
     */
    async markAsRead(messageId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Gmail API not initialized');
            }

            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: ['UNREAD']
                }
            });

            return true;
        } catch (error) {
            console.error('Failed to mark as read:', error);
            return false;
        }
    }

    /**
     * Get unread emails sent to specific address (useful for filtering inquiries)
     * @param {String} toEmail - Email address to filter by
     */
    async getUnreadEmailsTo(toEmail) {
        try {
            const query = `is:unread to:${toEmail}`;
            const messages = await this.listMessages(query, 50);

            const fullMessages = [];
            for (const message of messages) {
                const fullMessage = await this.getMessage(message.id);
                const parsed = this.parseMessage(fullMessage);
                fullMessages.push(parsed);
            }

            return fullMessages;
        } catch (error) {
            console.error('Failed to get unread emails:', error);
            return [];
        }
    }

    /**
     * Poll for new emails (alternative to push notifications)
     * Can be called via cron job
     */
    async pollForNewEmails() {
        try {
            if (!this.isInitialized) {
                console.log('Gmail API not initialized, skipping poll');
                return [];
            }

            // Get unread emails from last 1 hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const timestamp = Math.floor(oneHourAgo.getTime() / 1000);
            const query = `is:unread after:${timestamp}`;

            const messages = await this.listMessages(query, 20);
            console.log(`Found ${messages.length} unread emails in last hour`);

            const fullMessages = [];
            for (const message of messages) {
                const fullMessage = await this.getMessage(message.id);
                const parsed = this.parseMessage(fullMessage);
                fullMessages.push(parsed);
            }

            return fullMessages;
        } catch (error) {
            console.error('Failed to poll for new emails:', error);
            return [];
        }
    }

    /**
     * Process a new email notification (from Gmail push notification)
     * @param {Object} notification - Gmail push notification payload
     */
    async processNotification(notification) {
        try {
            if (!this.isInitialized) {
                throw new Error('Gmail API not initialized');
            }

            const data = notification.message.data;
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const emailData = JSON.parse(decodedData);

            // Get the full message
            const message = await this.getMessage(emailData.emailAddress);
            const parsed = this.parseMessage(message);

            // Mark as read after processing
            await this.markAsRead(message.id);

            return parsed;
        } catch (error) {
            console.error('Failed to process notification:', error);
            throw error;
        }
    }

    /**
     * Strip HTML tags from email body
     * @param {String} html - HTML content
     */
    stripHtml(html) {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Get email body as plain text
     * @param {Object} parsed - Parsed email object
     */
    getBodyText(parsed) {
        if (parsed.text) return parsed.text;
        if (parsed.html) return this.stripHtml(parsed.html);
        return '';
    }
}

module.exports = new GmailService();
