import React, { useState } from 'react';
import { Listing } from '../../types';

interface VerificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    property: Listing;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
    isOpen,
    onClose,
    property
}) => {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const services = [
        { id: 'title', name: 'Title Deed Authenticity', cost: 5000 },
        { id: 'ownership', name: 'Ownership Records', cost: 3000 },
        { id: 'registry', name: 'Land Registry Check', cost: 4000 },
        { id: 'encumbrance', name: 'Encumbrance Search', cost: 6000 },
        { id: 'inspection', name: 'Physical Site Inspection', cost: 10000 },
        { id: 'legal', name: 'Legal Due Diligence', cost: 15000 }
    ];

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const totalCost = services
        .filter(s => selectedServices.includes(s.id))
        .reduce((sum, s) => sum + s.cost, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Property Verification
                            </h3>
                            <p className="text-purple-100 mt-1 text-sm">
                                {property.title}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-900 dark:text-purple-100">
                            Select the verification services you need. Our certified professionals will conduct thorough checks and provide detailed reports.
                        </p>
                    </div>

                    {/* Services Checklist */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                            What would you like to verify?
                        </h4>
                        {services.map((service) => (
                            <label
                                key={service.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedServices.includes(service.id)}
                                    onChange={() => toggleService(service.id)}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {service.name}
                                    </p>
                                </div>
                                <p className="font-semibold text-purple-600 dark:text-purple-400">
                                    KSh {service.cost.toLocaleString()}
                                </p>
                            </label>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Total Cost
                                </p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    KSh {totalCost.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Timeline
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    5-7 Days
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            disabled={selectedServices.length === 0}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Request Verification
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
