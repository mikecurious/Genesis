
import React from 'react';
import { UserRole, PlanName } from '../../types';

interface ConfirmationProps {
    role: UserRole;
    plan: PlanName;
}

const planDetails = {
    [PlanName.Basic]: { price: '1,000 KSh/month' },
    [PlanName.MyGF1_3]: { price: '2,500 KSh/month' },
    [PlanName.MyGF3_2]: { price: '5,000 KSh/month' },
    [PlanName.None]: { price: 'Free' }
};

export const Confirmation: React.FC<ConfirmationProps> = ({ role, plan }) => {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Review Your Choices</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You're one step away from unlocking the power of MyGF AI.</p>

            <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md mx-auto text-left space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Selected Role</h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{role}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Selected Plan</h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{plan}</p>
                    <p className="text-md text-indigo-600 dark:text-indigo-400">{planDetails[plan]?.price || 'Free'}</p>
                </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 max-w-md mx-auto">
                <p>By clicking "Continue to Payment", you agree to our Terms of Service. Your subscription will auto-renew monthly. You can cancel anytime from your dashboard.</p>
            </div>
        </div>
    );
};
