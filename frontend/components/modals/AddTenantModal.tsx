
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in border border-gray-200/50 dark:border-gray-700/50">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-white drop-shadow-lg">Add Tenant</h3>
                                <p className="text-indigo-100 text-xs">Invite a new tenant</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-2xl p-2 transition-all duration-200 transform hover:rotate-90"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 14 14">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-7">
                    <div className="space-y-5">
                        <div className="group">
                            <label htmlFor="name" className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Tenant Full Name
                            </label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-indigo-300 dark:group-hover:border-indigo-600" placeholder="John Doe" />
                        </div>
                        <div className="group">
                            <label htmlFor="unit" className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Property & Unit
                            </label>
                            <input type="text" id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} required disabled={isSubmitting} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-indigo-300 dark:group-hover:border-indigo-600" placeholder="e.g., Apt 3B, Modern 2-Bedroom" />
                        </div>
                        <div className="group">
                            <label htmlFor="email" className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Tenant Email
                            </label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-indigo-300 dark:group-hover:border-indigo-600" placeholder="tenant@example.com" />
                        </div>
                        <div className="group">
                            <label htmlFor="phone" className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Tenant Phone
                            </label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting} className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md group-hover:border-indigo-300 dark:group-hover:border-indigo-600" placeholder="+254712345678" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-6 mt-5 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="relative flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 border border-white/20 overflow-hidden group min-w-[180px]">
                            {isSubmitting ? (
                                <SpinnerIcon />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Add & Invite Tenant
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
