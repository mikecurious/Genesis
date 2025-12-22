import React from 'react';
import { PlanName } from '../../types';

interface PlanSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlan: (plan: PlanName, price: string) => void;
    currentPlan?: PlanName;
}

const plans = [
    {
        name: PlanName.Basic,
        price: 'Free',
        features: ['Basic Listings', 'Standard Support', 'Limited AI Access'],
        color: 'gray'
    },
    {
        name: PlanName.MyGF1_3,
        price: '15,000 KSh/mo',
        features: ['Advanced AI Chat', 'Priority Support', 'Unlimited Listings', 'Market Analytics'],
        color: 'indigo',
        recommended: true
    },
    {
        name: PlanName.MyGF3_2,
        price: '25,000 KSh/mo',
        features: ['Full AI Automation', 'Dedicated Account Manager', 'Premium Marketing', 'API Access'],
        color: 'purple'
    }
];

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({ isOpen, onClose, onSelectPlan, currentPlan }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Choose the perfect plan to scale your real estate business.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrent = currentPlan === plan.name;
                            return (
                                <div
                                    key={plan.name}
                                    className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-300 hover:scale-105 ${isCurrent
                                            ? 'border-green-500 ring-2 ring-green-500/20'
                                            : plan.recommended
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {plan.recommended && !isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                            RECOMMENDED
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                            CURRENT PLAN
                                        </div>
                                    )}

                                    <div className="text-center mb-6 mt-2">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{plan.price}</div>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <svg className={`w-5 h-5 mr-2 ${isCurrent ? 'text-green-500' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => !isCurrent && onSelectPlan(plan.name, plan.price)}
                                        disabled={isCurrent}
                                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${isCurrent
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-default'
                                                : plan.recommended
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30'
                                                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                                            }`}
                                    >
                                        {isCurrent ? 'Active' : 'Select Plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
