import React, { useState } from 'react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientEmail: string;
    subject: string;
    defaultMessage: string;
    context?: {
        propertyTitle?: string;
        propertyLocation?: string;
        propertyPrice?: string;
        surveyorName?: string;
    };
}

export const EmailModal: React.FC<EmailModalProps> = ({
    isOpen,
    onClose,
    recipientName,
    recipientEmail,
    subject,
    defaultMessage,
    context
}) => {
    const [message, setMessage] = useState(defaultMessage);
    const [senderName, setSenderName] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        if (!senderName || !senderEmail || !message) {
            setError('Please fill in all required fields');
            return;
        }

        setSending(true);
        setError('');

        try {
            const response = await fetch('/api/emails/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: recipientEmail,
                    subject,
                    message,
                    senderName,
                    senderEmail,
                    senderPhone,
                    context
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
                setTimeout(() => {
                    onClose();
                    // Reset form
                    setSent(false);
                    setMessage(defaultMessage);
                    setSenderName('');
                    setSenderEmail('');
                    setSenderPhone('');
                }, 2000);
            } else {
                setError(data.error || 'Failed to send email');
            }
        } catch (err) {
            setError('Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Email</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            To: {recipientName} ({recipientEmail})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {sent ? (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Sent!</h3>
                            <p className="text-gray-600 dark:text-gray-400">Your message has been delivered to {recipientName}.</p>
                        </div>
                    ) : (
                        <>
                            {/* Context Information */}
                            {context && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Message Context:</p>
                                    {context.propertyTitle && (
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            <strong>Property:</strong> {context.propertyTitle}
                                        </p>
                                    )}
                                    {context.propertyLocation && (
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            <strong>Location:</strong> {context.propertyLocation}
                                        </p>
                                    )}
                                    {context.propertyPrice && (
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            <strong>Price:</strong> {context.propertyPrice}
                                        </p>
                                    )}
                                    {context.surveyorName && (
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            <strong>Surveyor:</strong> {context.surveyorName}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Your Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={senderName}
                                        onChange={(e) => setSenderName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={senderEmail}
                                        onChange={(e) => setSenderEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={senderPhone}
                                        onChange={(e) => setSenderPhone(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="+254 700 000 000"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    placeholder="Type your message here..."
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    You can edit the message above before sending
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending}
                                    className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Send Email
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
