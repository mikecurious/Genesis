import React, { useState, useEffect } from 'react';
import { paymentService, type Payment, type PaymentMethod } from '../../services/paymentService';

interface MpesaPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    paymentType?: 'subscription' | 'property' | 'service' | 'tenant_payment' | 'other';
    plan?: string;
    metadata?: any;
    onSuccess?: (payment: Payment) => void;
    onFailed?: (payment: Payment) => void;
}

type PaymentStatus = 'idle' | 'initiating' | 'pending_confirmation' | 'processing' | 'completed' | 'failed';

export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    description,
    paymentType = 'other',
    plan,
    metadata,
    onSuccess,
    onFailed,
}) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formattedPhone, setFormattedPhone] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [payment, setPayment] = useState<Payment | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<'paybill' | 'till'>('paybill');
    const [loadingMethods, setLoadingMethods] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStatus('idle');
            setError('');
            setPayment(null);
            setCountdown(60);

            // Fetch available payment methods
            fetchPaymentMethods();
        }
    }, [isOpen]);

    const fetchPaymentMethods = async () => {
        try {
            setLoadingMethods(true);
            const response = await paymentService.getPaymentMethods();
            const methods = response.data || [];
            setPaymentMethods(methods);

            // Set default selection to first available method
            if (methods.length > 0) {
                setSelectedMethod(methods[0].type);
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
            // Default to paybill if fetch fails
            setPaymentMethods([]);
        } finally {
            setLoadingMethods(false);
        }
    };

    useEffect(() => {
        // Countdown timer when waiting for confirmation
        if (status === 'pending_confirmation' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [status, countdown]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneNumber(value);

        if (value) {
            const formatted = paymentService.formatPhoneNumber(value);
            setFormattedPhone(formatted);
        } else {
            setFormattedPhone('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate phone number
        if (!paymentService.isValidKenyanPhone(phoneNumber)) {
            setError('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
            return;
        }

        const formatted = paymentService.formatPhoneNumber(phoneNumber);

        console.log('💳 Initiating payment:', {
            phoneNumber: formatted,
            amount,
            paymentType,
            description,
            mpesaMode: selectedMethod
        });

        try {
            setStatus('initiating');

            let response;
            if (plan) {
                // Subscription payment
                console.log('📝 Initiating subscription payment for plan:', plan);
                response = await paymentService.initiateSubscriptionPayment({
                    plan,
                    phoneNumber: formatted,
                    mpesaMode: selectedMethod,
                });
            } else {
                // Generic payment
                console.log('📝 Initiating generic payment');
                response = await paymentService.initiatePayment({
                    phoneNumber: formatted,
                    amount,
                    paymentType,
                    description,
                    metadata,
                    mpesaMode: selectedMethod,
                });
            }

            console.log('📥 Payment initiation response:', response);

            if (response.success) {
                console.log(`✅ STK push sent successfully! Payment ID: ${response.paymentId}`);
                setStatus('pending_confirmation');
                setCountdown(60);

                // Start polling for payment status
                const paymentId = response.paymentId;
                console.log(`🔄 Starting to poll payment status for ${paymentId}`);
                pollPaymentStatus(paymentId);
            } else {
                console.error('❌ Payment initiation failed:', response.message);
                setError(response.message || 'Failed to initiate payment');
                setStatus('failed');
            }
        } catch (err: any) {
            // Extract error message from axios error response
            const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate payment';
            console.error('❌ Error initiating payment:', errorMessage, err);
            setError(errorMessage);
            setStatus('failed');
        }
    };

    const pollPaymentStatus = async (paymentId: string) => {
        try {
            const completedPayment = await paymentService.pollPaymentStatus(
                paymentId,
                (updatedPayment) => {
                    setPayment(updatedPayment);
                    if (updatedPayment.status === 'processing') {
                        setStatus('processing');
                    }
                },
                30,
                2000
            );

            setPayment(completedPayment);

            if (completedPayment.status === 'completed') {
                setStatus('completed');
                if (onSuccess) {
                    onSuccess(completedPayment);
                }
            } else {
                setStatus('failed');
                setError(completedPayment.resultDesc || 'Payment failed');
                if (onFailed) {
                    onFailed(completedPayment);
                }
            }
        } catch (err: any) {
            setStatus('failed');
            setError('Payment confirmation timed out. Please check your payment history.');
        }
    };

    const handleClose = () => {
        if (status !== 'pending_confirmation' && status !== 'processing') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-3xl">💳</span>
                        M-Pesa Payment
                    </h2>
                    {status !== 'pending_confirmation' && status !== 'processing' && (
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {status === 'idle' || status === 'initiating' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Payment Details:</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                KES {amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                        </div>

                        {/* Payment Method Selection */}
                        {!loadingMethods && paymentMethods.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {paymentMethods.map((method) => (
                                        <label
                                            key={method.type}
                                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedMethod === method.type
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.type}
                                                checked={selectedMethod === method.type}
                                                onChange={(e) => setSelectedMethod(e.target.value as 'paybill' | 'till')}
                                                className="mt-1"
                                                disabled={status === 'initiating'}
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {method.name}
                                                    </span>
                                                    {method.type === 'paybill' && method.shortCode && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Paybill: {method.shortCode}
                                                        </span>
                                                    )}
                                                    {method.type === 'till' && method.tillNumber && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Till: {method.tillNumber}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {method.description}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                M-Pesa Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="0712345678 or 254712345678"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                                disabled={status === 'initiating'}
                            />
                            {formattedPhone && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Will be sent to: {formattedPhone}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'initiating'}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'initiating' ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Initiating...
                                </>
                            ) : (
                                <>
                                    <span>Pay with M-Pesa</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            You'll receive an STK push notification on your phone
                        </p>
                    </form>
                ) : status === 'pending_confirmation' || status === 'processing' ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                            <svg className="w-12 h-12 text-green-600 dark:text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Check Your Phone
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            An M-Pesa prompt has been sent to <br/>
                            <span className="font-mono font-semibold">{formattedPhone}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Enter your M-Pesa PIN to complete the payment
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-blue-700 dark:text-blue-300 font-medium">
                                    {status === 'processing' ? 'Processing payment...' : 'Waiting for confirmation...'}
                                </span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Time remaining: {countdown}s
                            </p>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Please don't close this window
                        </p>
                    </div>
                ) : status === 'completed' ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                            Payment Successful!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Your payment of <span className="font-bold">KES {amount.toLocaleString()}</span> has been received.
                        </p>
                        {payment?.mpesaReceiptNumber && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Receipt: <span className="font-mono font-semibold">{payment.mpesaReceiptNumber}</span>
                            </p>
                        )}
                        <button
                            onClick={onClose}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                            <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                            Payment Failed
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error || 'The payment could not be completed. Please try again.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setStatus('idle');
                                    setError('');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
