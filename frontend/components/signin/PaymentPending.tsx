
import React from 'react';
import { type User } from '../../types';

interface PaymentPendingProps {
    user: User | null;
    onCompletePayment: () => void;
}

export const PaymentPending: React.FC<PaymentPendingProps> = ({ user, onCompletePayment }) => {
    return (
         <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center justify-center pt-16">
            <div className="w-full max-w-md text-center animate-fade-in-up">
                 <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 md:p-10">
                    <h1 className="text-2xl font-bold tracking-tight text-yellow-500">Payment Required</h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        Welcome, {user?.name || 'Agent'}! Your account is created, but payment for your selected plan is pending.
                    </p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                        Please complete your payment to access your dashboard and unlock all AI features.
                    </p>
                    <button 
                        onClick={onCompletePayment}
                        className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Complete Payment
                    </button>
                 </div>
            </div>
        </div>
    );
};
