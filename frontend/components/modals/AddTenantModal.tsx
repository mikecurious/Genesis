
import React, { useState, FormEvent } from 'react';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface AddTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTenant: (tenantData: { name: string; unit: string; email: string; phone: string; }) => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onAddTenant }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onAddTenant({ name, unit, email, phone });
            // Clear form for next time
            setName('');
            setUnit('');
            setEmail('');
            setPhone('');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Tenant</h3>
                    <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Full Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="John Doe" />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Property & Unit</label>
                            <input type="text" id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} required disabled={isSubmitting} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="e.g., Apt 3B, Modern 2-Bedroom" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="tenant@example.com" />
                        </div>
                         <div>
                            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tenant Phone</label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting} className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="+254712345678" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end pt-6 mt-4 border-t border-gray-200 dark:border-gray-600 rounded-b">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]">
                            {isSubmitting ? <SpinnerIcon /> : 'Add & Invite Tenant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
