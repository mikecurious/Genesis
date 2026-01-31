/**
 * WhatsApp Message Templates for Meta Approval
 *
 * These templates must be submitted to Meta/WhatsApp for approval before they can be used.
 * Templates are required for sending notifications outside the 24-hour messaging window.
 *
 * How to submit templates:
 * 1. Go to Twilio Console > Messaging > Content Templates
 * 2. Create new WhatsApp template using the structures below
 * 3. Submit for WhatsApp approval
 * 4. Once approved, update the TEMPLATE_SID in .env for each template
 *
 * Template Format:
 * - Use {{1}}, {{2}}, {{3}} etc. for variable placeholders
 * - Variables must be numbered sequentially
 * - Keep messages clear and professional
 * - Include opt-out language if required by your region
 */

module.exports = {
    /**
     * Template: Lead Notification
     * Purpose: Notify property owners/agents about new leads
     * Variables: dealType, propertyTitle, propertyLocation, propertyPrice, clientName, clientPhone, clientEmail
     */
    LEAD_NOTIFICATION: {
        name: 'lead_notification',
        category: 'TRANSACTIONAL',
        language: 'en',
        body: `🎉 *New Lead Captured!*

{{1}}

*Property:* {{2}}
*Location:* {{3}}
*Price:* {{4}}

*Client Details:*
👤 Name: {{5}}
📱 Phone: {{6}}
📧 Email: {{7}}

Contact the client ASAP!

---
MyGF AI - Your Smart Real Estate Assistant`,
        // Example usage
        example: {
            variables: [
                '🏠 Purchase Inquiry',
                'Luxury Villa in Westlands',
                'Westlands, Nairobi',
                'KSh 25,000,000',
                'John Doe',
                '+254712345678',
                'john@example.com'
            ]
        }
    },

    /**
     * Template: Viewing Confirmation
     * Purpose: Confirm viewing requests to clients
     * Variables: clientName, propertyTitle, viewingDate, agentName, agentPhone
     */
    VIEWING_CONFIRMATION: {
        name: 'viewing_confirmation',
        category: 'TRANSACTIONAL',
        language: 'en',
        body: `✅ *Viewing Confirmed!*

Hi {{1}},

Your viewing for *{{2}}* has been confirmed!

*Date & Time:* {{3}}
*Agent:* {{4}}
*Agent Phone:* {{5}}

The agent will contact you shortly to provide directions.

We're excited to help you find your perfect property!

---
MyGF AI - Your Smart Real Estate Assistant`,
        example: {
            variables: [
                'Jane Smith',
                'Modern Apartment in Kilimani',
                'January 31, 2026 at 2:00 PM',
                'Michael Kimani',
                '+254700123456'
            ]
        }
    },

    /**
     * Template: Rent Reminder
     * Purpose: Send rent payment reminders to tenants
     * Variables: tenantName, propertyTitle, rentAmount, dueDate
     */
    RENT_REMINDER: {
        name: 'rent_reminder',
        category: 'TRANSACTIONAL',
        language: 'en',
        body: `💰 *Rent Reminder*

Hi {{1}},

Your rent for *{{2}}* is due on {{4}}.

*Amount Due:* KSh {{3}}

Please make your payment on time to avoid late fees.

Thank you for your prompt attention!

---
MyGF AI - Property Management`,
        example: {
            variables: [
                'Sarah Johnson',
                'Apartment 3B, Riverside Towers',
                '45,000',
                'February 5, 2026'
            ]
        }
    },

    /**
     * Template: Maintenance Update
     * Purpose: Notify tenants/owners about maintenance request status
     * Variables: recipientName, propertyTitle, requestType, status, technicianName, estimatedTime
     */
    MAINTENANCE_UPDATE: {
        name: 'maintenance_update',
        category: 'TRANSACTIONAL',
        language: 'en',
        body: `🔧 *Maintenance Update*

Hi {{1}},

Your maintenance request for *{{2}}* has been updated.

*Request Type:* {{3}}
*Status:* {{4}}
*Technician:* {{5}}
*Estimated Time:* {{6}}

We appreciate your patience!

---
MyGF AI - Property Management`,
        example: {
            variables: [
                'David Omondi',
                'Villa 12, Garden Estate',
                'Plumbing Repair',
                'In Progress',
                'Peter Mwangi',
                'Completion by 3:00 PM today'
            ]
        }
    },

    /**
     * Template: Welcome Message
     * Purpose: Welcome new clients who contact via WhatsApp
     * Variables: clientName
     */
    WELCOME_MESSAGE: {
        name: 'welcome_message',
        category: 'TRANSACTIONAL',
        language: 'en',
        body: `👋 *Welcome to My Genesis Fortune!*

Hi {{1}},

Thank you for reaching out! We're here to help you find your perfect property.

Our team will respond to your inquiry shortly. In the meantime, feel free to ask any questions!

Visit our website: https://mygenesisfortune.com

---
MyGF AI - Your Smart Real Estate Assistant`,
        example: {
            variables: ['Michael']
        }
    },

    /**
     * Template: Payment Confirmation
     * Purpose: Confirm successful rent/deposit payments
     * Variables: recipientName, propertyTitle, amount, paymentMethod, transactionRef
     */
    PAYMENT_CONFIRMATION: {
        name: 'payment_confirmation',
        category: 'TRANSACTIONAL',
        language: 'en',
        body: `✅ *Payment Received*

Hi {{1}},

We've received your payment for *{{2}}*.

*Amount:* KSh {{3}}
*Payment Method:* {{4}}
*Transaction Reference:* {{5}}

Thank you for your payment!

---
MyGF AI - Property Management`,
        example: {
            variables: [
                'Grace Wanjiku',
                'Studio Apartment 5A',
                '30,000',
                'M-Pesa',
                'QA7XM9N3K2'
            ]
        }
    }
};
