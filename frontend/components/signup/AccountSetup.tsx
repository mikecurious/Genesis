
import React, { useState } from 'react';
import { UserRole, PlanName, SubscriptionPlan } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';

interface AccountSetupProps {
    onSetupComplete: (role: UserRole, plan: PlanName) => void;
}

const roles = [
    { name: UserRole.Agent, description: 'Full features: Sell and rent properties, manage tenants.' },
    { name: UserRole.PropertySeller, description: 'Sell properties and maximize your investment returns.' },
    { name: UserRole.Landlord, description: 'Rent properties and manage tenants with AI assistance.' },
    { name: UserRole.Surveyor, description: 'Accept survey tasks, upload reports, and earn from property surveys.' },
];

const plans: SubscriptionPlan[] = [
    { name: PlanName.Basic, price: '1,000 KSh', features: ['5 Active Listings', 'Basic Analytics', 'Standard Support'] },
    { name: PlanName.MyGF1_3, price: '2,500 KSh', features: ['20 Active Listings', 'Advanced Analytics', 'AI Listing Enhancement'] },
    { name: PlanName.MyGF3_2, price: '5,000 KSh', features: ['Unlimited Listings', 'Full AI Insights Suite', 'Dedicated Account Manager'] }
];

const RoleCard: React.FC<{ role: typeof roles[0]; isSelected: boolean; onSelect: () => void }> = ({ role, isSelected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`relative text-left w-full h-full p-5 border rounded-lg transition-all duration-300 ${isSelected ? 'border-green-500 bg-gray-50 dark:bg-gray-800 scale-105 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
        {isSelected && (
            <div className="absolute top-3 right-3 bg-green-600 text-white rounded-full p-1">
                <CheckIcon className="w-4 h-4" />
            </div>
        )}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{role.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
    </button>
);

const PlanCard: React.FC<{ plan: SubscriptionPlan; isSelected: boolean; onSelect: () => void }> = ({ plan, isSelected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`relative text-left w-full h-full p-5 border rounded-lg transition-all duration-300 flex flex-col ${isSelected ? 'border-green-500 bg-gray-50 dark:bg-gray-800 scale-105 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
        {isSelected && (
            <div className="absolute top-3 right-3 bg-green-600 text-white rounded-full p-1">
                <CheckIcon className="w-4 h-4" />
            </div>
        )}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{plan.price}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/month</span></p>
        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
        <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 flex-grow">
            {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </button>
);

export const AccountSetup: React.FC<AccountSetupProps> = ({ onSetupComplete }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);

    const handleNext = () => {
        if (selectedRole && selectedPlan) {
            onSetupComplete(selectedRole, selectedPlan);
        }
    }

    // Auto-select 'None' plan for surveyors
    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        if (role === UserRole.Surveyor) {
            setSelectedPlan(PlanName.None);
        } else {
            setSelectedPlan(null);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="text-center">
                <h2 className="text-2xl font-semibold">Setup Your Account</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Choose your role and select a plan to get started.</p>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-center md:text-left">1. Choose Your Role</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {roles.map(role => (
                            <RoleCard
                                key={role.name}
                                role={role}
                                isSelected={selectedRole === role.name}
                                onSelect={() => handleRoleSelect(role.name)}
                            />
                        ))}
                    </div>
                </div>

                {selectedRole !== UserRole.Surveyor && (
                    <div className={`transition-opacity duration-500 ${selectedRole ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                        <h3 className="text-lg font-semibold mb-3 text-center md:text-left">2. Select Your Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map(plan => (
                                <PlanCard
                                    key={plan.name}
                                    plan={plan}
                                    isSelected={selectedPlan === plan.name}
                                    onSelect={() => setSelectedPlan(plan.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleNext}
                    disabled={!selectedRole || !selectedPlan}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
