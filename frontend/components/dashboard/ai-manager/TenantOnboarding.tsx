import React, { useState } from 'react';
import { Tenant } from '../../../types';

interface TenantOnboardingProps {
    onAddTenant: (tenant: Omit<Tenant, 'id' | 'rentStatus'>) => void;
    onCancel: () => void;
}

export const TenantOnboarding: React.FC<TenantOnboardingProps> = ({ onAddTenant, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsappNumber: '',
        unit: '',
        rentAmount: '',
        leaseStart: '',
        leaseEnd: '',
        deposit: '',
        paymentDay: '1',
    });

    const [isAiSettingUp, setIsAiSettingUp] = useState(false);
    const [setupStep, setSetupStep] = useState(0);

    const setupSteps = [
        "Creating tenant profile...",
        "Generating lease agreement...",
        "Setting up rent schedule...",
        "Configuring WhatsApp reminders...",
        "Sending welcome message..."
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAiSettingUp(true);

        // Simulate AI Setup Process
        for (let i = 0; i < setupSteps.length; i++) {
            setSetupStep(i);
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        onAddTenant({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            whatsappNumber: formData.whatsappNumber,
            unit: formData.unit,
            rentAmount: Number(formData.rentAmount),
            leaseStart: formData.leaseStart,
            leaseEnd: formData.leaseEnd,
            deposit: Number(formData.deposit),
            paymentDay: Number(formData.paymentDay),
        });
    };

    if (isAiSettingUp) {
        return (
            <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping"></div>
                    <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Manager is working...</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{setupSteps[setupStep]}</p>

                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-green-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${((setupStep + 1) / setupSteps.length) * 100}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Tenant</h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Personal Info</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input required name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="+1 234 567 890" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number</label>
                            <input required type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="+1 234 567 890" />
                        </div>
                    </div>

                    {/* Lease Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Lease Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit / Property</label>
                            <input required name="unit" value={formData.unit} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Apt 4B" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent Amount</label>
                                <input required type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="2500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Day</label>
                                <input required type="number" min="1" max="31" name="paymentDay" value={formData.paymentDay} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lease Start</label>
                                <input required type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lease End</label>
                                <input required type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Deposit</label>
                            <input required type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="2500" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">
                        Add Tenant & Start AI
                    </button>
                </div>
            </form>
        </div>
    );
};
