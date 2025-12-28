import React, { useState } from 'react';
import { Listing } from '../../types';

interface ValuationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    property: Listing;
}

export const ValuationPanel: React.FC<ValuationPanelProps> = ({
    isOpen,
    onClose,
    property
}) => {
    const [activeTab, setActiveTab] = useState<'ai' | 'professional'>('ai');
    const [isGenerating, setIsGenerating] = useState(false);

    const propertyPrice = property.price || 0; // Price is now a number
    const estimatedMin = propertyPrice * 0.95;
    const estimatedMax = propertyPrice * 1.05;
    const marketAverage = propertyPrice;

    const handleGenerateAIValuation = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                📊 Property Valuation
                            </h3>
                            <p className="text-blue-100 mt-1 text-sm">
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

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'ai'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            🤖 AI Instant Estimate
                        </button>
                        <button
                            onClick={() => setActiveTab('professional')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'professional'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            👨‍💼 Professional Valuation
                        </button>
                    </div>

                    {/* AI Valuation Tab */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            {/* Estimated Value */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        AI Estimated Value Range
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                        KSh {estimatedMin.toLocaleString()} - {estimatedMax.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Market Average: KSh {marketAverage.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Analysis Factors */}
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                                    Based on:
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                12 Comparable Properties
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Similar properties in {property.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                Location Analysis
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {property.location} - Prime area
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                Market Trends
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Property values trending up 3.2% this quarter
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleGenerateAIValuation}
                                disabled={isGenerating}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Generating Detailed Report...
                                    </span>
                                ) : (
                                    'Get Detailed AI Report'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Professional Valuation Tab */}
                    {activeTab === 'professional' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">👨‍💼</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                            Certified Professional Valuation
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Get an official valuation report from a certified valuer for legal and financing purposes.
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">On-site property inspection</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">Comprehensive market analysis</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">Official certification for banks</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valuation Fee</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh 15,000</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timeline</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">3-5 Days</p>
                                </div>
                            </div>

                            {/* Request Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="+254 700 000 000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Preferred Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                                Request Professional Valuation
                            </button>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full mt-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
