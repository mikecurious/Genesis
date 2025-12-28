import api from './apiService';

export interface PaymentMethod {
    type: 'paybill' | 'till';
    name: string;
    shortCode?: string;
    tillNumber?: string;
    description: string;
}

export interface InitiatePaymentRequest {
    plan: string;
    phoneNumber: string;
    mpesaMode?: 'paybill' | 'till';
}

export interface InitiateGenericPaymentRequest {
    phoneNumber: string;
    amount: number;
    paymentType?: 'subscription' | 'property' | 'service' | 'tenant_payment' | 'other';
    description?: string;
    metadata?: any;
    mpesaMode?: 'paybill' | 'till';
}

export interface Payment {
    _id: string;
    user: string;
    phoneNumber: string;
    amount: number;
    plan?: string;
    merchantRequestID?: string;
    checkoutRequestID?: string;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    resultCode?: string;
    resultDesc?: string;
    paymentType: string;
    paymentMethod: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
}

export const paymentService = {
    /**
     * Get available M-Pesa payment methods
     */
    async getPaymentMethods() {
        const response = await api.get('/api/payments/methods');
        return response.data;
    },

    /**
     * Initiate subscription payment with M-Pesa STK Push
     */
    async initiateSubscriptionPayment(data: InitiatePaymentRequest) {
        const response = await api.post('/api/payments/initiate', data);
        return response.data;
    },

    /**
     * Initiate generic payment with M-Pesa STK Push
     */
    async initiatePayment(data: InitiateGenericPaymentRequest) {
        const response = await api.post('/api/payments/pay', data);
        return response.data;
    },

    /**
     * Query payment status
     */
    async queryPaymentStatus(paymentId: string) {
        const response = await api.get(`/api/payments/${paymentId}/status`);
        return response.data;
    },

    /**
     * Get user payment history
     */
    async getPaymentHistory() {
        const response = await api.get('/api/payments/history');
        return response.data;
    },

    /**
     * Format phone number to M-Pesa format (254XXXXXXXXX)
     */
    formatPhoneNumber(phone: string): string {
        // Remove all non-numeric characters (including + sign)
        let cleaned = phone.replace(/\D/g, '');

        // Handle different formats
        if (cleaned.startsWith('254')) {
            // Already in correct format (e.g., 254712345678 or +254712345678)
            return cleaned;
        } else if (cleaned.startsWith('0')) {
            // Kenyan format starting with 0 (e.g., 0712345678)
            return '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
            // Phone number without country code (e.g., 712345678)
            return '254' + cleaned;
        }

        return cleaned;
    },

    /**
     * Validate Kenyan phone number
     */
    isValidKenyanPhone(phone: string): boolean {
        const formatted = this.formatPhoneNumber(phone);
        return /^254\d{9}$/.test(formatted);
    },

    /**
     * Poll payment status until completed or failed
     */
    async pollPaymentStatus(
        paymentId: string,
        onStatusChange?: (payment: Payment) => void,
        maxAttempts: number = 30,
        intervalMs: number = 2000
    ): Promise<Payment> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const response = await this.queryPaymentStatus(paymentId);
            const payment = response.data as Payment;

            if (onStatusChange) {
                onStatusChange(payment);
            }

            // If payment is completed or failed, return
            if (payment.status === 'completed' || payment.status === 'failed') {
                return payment;
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        throw new Error('Payment status polling timed out');
    },
};
