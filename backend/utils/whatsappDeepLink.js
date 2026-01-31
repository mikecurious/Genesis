/**
 * WhatsApp Deep Link Utility
 *
 * Generates WhatsApp deep links (wa.me) for easy customer contact.
 * Deep links allow customers to start conversations with pre-filled messages.
 *
 * Base deep link: https://wa.me/12763238588
 * With message: https://wa.me/12763238588?text=Hello%20there
 */

const WHATSAPP_NUMBER = process.env.TWILIO_PHONE_NUMBER?.replace(/\D/g, '') || '12763238588';
const BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * Generate a basic WhatsApp deep link
 * @returns {string} Deep link URL
 */
const getBasicLink = () => {
    return BASE_URL;
};

/**
 * Generate WhatsApp deep link with pre-filled message
 * @param {string} message - The message to pre-fill
 * @returns {string} Deep link URL with message
 */
const getLinkWithMessage = (message) => {
    if (!message) return BASE_URL;

    const encodedMessage = encodeURIComponent(message);
    return `${BASE_URL}?text=${encodedMessage}`;
};

/**
 * Generate property inquiry deep link
 * @param {Object} property - Property object
 * @returns {string} Deep link for property inquiry
 */
const getPropertyInquiryLink = (property) => {
    const message = `Hi! I'm interested in your property: ${property.title || 'Property'}\n\nProperty ID: ${property._id}\n\nCould you provide more details?`;
    return getLinkWithMessage(message);
};

/**
 * Generate viewing request deep link
 * @param {Object} property - Property object
 * @returns {string} Deep link for viewing request
 */
const getViewingRequestLink = (property) => {
    const message = `Hi! I'd like to schedule a viewing for:\n\n${property.title || 'Property'}\nLocation: ${property.location || 'N/A'}\n\nWhen would be a good time?`;
    return getLinkWithMessage(message);
};

/**
 * Generate general contact deep link
 * @param {string} subject - Subject of the message
 * @returns {string} Deep link for general contact
 */
const getContactLink = (subject = '') => {
    const message = subject
        ? `Hi! I have a question about: ${subject}`
        : 'Hi! I have a question about your properties.';

    return getLinkWithMessage(message);
};

/**
 * Generate deep link with property ID reference
 * @param {string} propertyId - Property ID
 * @param {string} customMessage - Optional custom message
 * @returns {string} Deep link with property reference
 */
const getPropertyReferenceLink = (propertyId, customMessage = '') => {
    const message = customMessage
        ? `${customMessage}\n\nProperty ID: #${propertyId}`
        : `Hi! I'm interested in property #${propertyId}`;

    return getLinkWithMessage(message);
};

/**
 * Generate QR code URL for WhatsApp
 * @returns {string} QR code URL
 */
const getQRCodeUrl = () => {
    return `${BASE_URL}?qr=1`;
};

/**
 * Generate WhatsApp click-to-chat button HTML
 * @param {string} buttonText - Button text
 * @param {string} message - Pre-filled message
 * @param {string} className - CSS class for styling
 * @returns {string} HTML for WhatsApp button
 */
const getWhatsAppButtonHTML = (buttonText = 'Chat on WhatsApp', message = '', className = 'whatsapp-button') => {
    const link = message ? getLinkWithMessage(message) : BASE_URL;

    return `<a href="${link}" class="${className}" target="_blank" rel="noopener noreferrer">
    <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.369 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.245-2.16-1.913-4.597-1.913-7.057 0-7.444 6.056-13.5 13.5-13.5s13.5 6.056 13.5 13.5-6.056 13.5-13.5 13.5zM21.558 19.35c-0.294-0.147-1.738-0.858-2.008-0.956-0.27-0.098-0.467-0.147-0.663 0.147s-0.762 0.956-0.934 1.153c-0.172 0.196-0.344 0.221-0.638 0.074s-1.245-0.458-2.37-1.461c-0.876-0.781-1.467-1.745-1.639-2.039s-0.018-0.452 0.129-0.599c0.132-0.132 0.294-0.344 0.442-0.516s0.196-0.295 0.294-0.492c0.098-0.196 0.049-0.369-0.025-0.516s-0.663-1.597-0.908-2.187c-0.238-0.573-0.48-0.495-0.663-0.504-0.172-0.008-0.369-0.010-0.565-0.010s-0.516 0.074-0.786 0.369c-0.27 0.294-1.031 1.008-1.031 2.458s1.056 2.851 1.203 3.048c0.147 0.196 2.079 3.176 5.038 4.456 0.704 0.305 1.254 0.486 1.683 0.622 0.706 0.224 1.349 0.193 1.857 0.117 0.566-0.084 1.738-0.711 1.984-1.397s0.245-1.275 0.172-1.397c-0.074-0.123-0.27-0.196-0.565-0.344z"/>
    </svg>
    ${buttonText}
</a>`;
};

/**
 * Get all deep link configurations
 * @returns {Object} Deep link configuration
 */
const getDeepLinkConfig = () => {
    return {
        baseLink: BASE_URL,
        qrCodeUrl: getQRCodeUrl(),
        whatsappNumber: WHATSAPP_NUMBER,
        businessName: process.env.WHATSAPP_BUSINESS_NAME || 'My Genesis Fortune'
    };
};

module.exports = {
    getBasicLink,
    getLinkWithMessage,
    getPropertyInquiryLink,
    getViewingRequestLink,
    getContactLink,
    getPropertyReferenceLink,
    getQRCodeUrl,
    getWhatsAppButtonHTML,
    getDeepLinkConfig,
    WHATSAPP_NUMBER,
    BASE_URL
};
