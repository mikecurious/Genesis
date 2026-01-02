import React, { useState } from 'react';
import { type User, PlanName } from '../../types';
import { userService } from '../../services/apiService';
import { MpesaPaymentModal } from '../modals/MpesaPaymentModal';
import { PlanSelectionModal } from '../modals/PlanSelectionModal';
import type { Payment } from '../../services/paymentService';

interface SettingsProps {
    user: User;
    onUpdate?: (updatedUser: User) => void;
}

export const ProfileSettings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsappNumber: user.whatsappNumber || '',
        notificationPreferences: {
            email: user.notificationPreferences?.email ?? true,
            whatsapp: user.notificationPreferences?.whatsapp ?? false,
            push: user.notificationPreferences?.push ?? true
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Subscription State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: PlanName; price: string } | null>(null);
    const [paymentAction, setPaymentAction] = useState<'renew' | 'upgrade'>('renew');

    const validateWhatsAppNumber = (number: string): boolean => {
        if (!number) return true;
        return /^\+?[1-9]\d{1,14}$/.test(number);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.whatsappNumber && !validateWhatsAppNumber(formData.whatsappNumber)) {
            setMessage({
                type: 'error',
                text: 'Please enter a valid international phone number (e.g., +254712345678)'
            });
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await userService.updateProfile(user._id || user.id, {
                name: formData.name,
                phone: formData.phone,
                whatsappNumber: formData.whatsappNumber,
                notificationPreferences: formData.notificationPreferences
            });

            setMessage({
                type: 'success',
                text: 'Profile updated successfully!'
            });

            if (onUpdate && data.data) {
                onUpdate(data.data);
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to update profile'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRenewClick = () => {
        // Determine current plan price (mock logic)
        const currentPrice = user.subscription?.plan === PlanName.MyGF3_2 ? '25,000 KSh' : '15,000 KSh';
        setSelectedPlan({ name: user.subscription?.plan || PlanName.MyGF1_3, price: currentPrice });
        setPaymentAction('renew');
        setIsPaymentModalOpen(true);
    };

    const handleUpgradeClick = () => {
        setIsPlanModalOpen(true);
    };

    const handlePlanSelect = (plan: PlanName, price: string) => {
        setSelectedPlan({ name: plan, price });
        setPaymentAction('upgrade');
        setIsPlanModalOpen(false);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (payment: Payment) => {
        console.log(`✅ Payment successful for ${paymentAction}:`, selectedPlan?.name);

        // The subscription will be updated automatically by the backend callback
        // Just show success message and close modal
        setMessage({
            type: 'success',
            text: `Payment successful! Your plan has been ${paymentAction === 'renew' ? 'renewed' : 'upgraded'} to ${selectedPlan?.name}.`
        });

        setIsPaymentModalOpen(false);
        setSelectedPlan(null);

        // Optionally reload user data to show updated subscription
        // if (onUpdate) {
        //     // Refresh user data from backend
        // }
    };

    const handlePaymentFailed = (payment: Payment) => {
        console.log('Payment failed or cancelled');
        setMessage({
            type: 'error',
            text: 'Payment was not completed. Please try again.'
        });
        setIsPaymentModalOpen(false);
        setSelectedPlan(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Subscription & Billing Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Subscription & Billing
                </h2>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Current Plan</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{user.subscription?.plan || 'Basic Plan'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
                            Status:
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {user.subscription?.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleRenewClick}
                            className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Renew Plan
                        </button>
                        <button
                            onClick={handleUpgradeClick}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/30 transition-all"
                        >
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Profile Settings
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+254712345678"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    placeholder="+254712345678"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notificationPreferences.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        notificationPreferences: {
                                            ...formData.notificationPreferences,
                                            email: e.target.checked
                                        }
                                    })}
                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notificationPreferences.whatsapp}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        notificationPreferences: {
                                            ...formData.notificationPreferences,
                                            whatsapp: e.target.checked
                                        }
                                    })}
                                    disabled={!formData.whatsappNumber}
                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                />
                                <span className="text-gray-700 dark:text-gray-300">WhatsApp Notifications</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notificationPreferences.push}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        notificationPreferences: {
                                            ...formData.notificationPreferences,
                                            push: e.target.checked
                                        }
                                    })}
                                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                            </label>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Modals */}
            <PlanSelectionModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                onSelectPlan={handlePlanSelect}
                currentPlan={user.subscription?.plan}
            />

            {selectedPlan && (
                <MpesaPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={handlePaymentSuccess}
                    onFailed={handlePaymentFailed}
                    amount={selectedPlan.name === PlanName.MyGF3_2 ? 25000 : 15000}
                    description={paymentAction === 'renew'
                        ? `Renew ${selectedPlan.name} Subscription`
                        : `Upgrade to ${selectedPlan.name}`}
                    paymentType="subscription"
                    metadata={{
                        plan: selectedPlan.name,
                        action: paymentAction
                    }}
                />
            )}
        </div>
    );
};

