
import React from 'react';

interface FeaturePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    price: string;
}

export const FeaturePaymentModal: React.FC<FeaturePaymentModalProps> = ({ isOpen, onClose, onConfirm, title, description, price }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <svg className="mx-auto mb-4 text-yellow-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mb-4 text-gray-500 dark:text-gray-400">{description}</p>
                    <p className="mb-6 text-xl font-semibold text-indigo-600 dark:text-indigo-400">{price}</p>

                    <button 
                        onClick={onConfirm}
                        className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-6 py-2.5 text-center mr-2"
                    >
                        Confirm Payment
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
