import React, { useState } from 'react';
import { AIDocumentVerification } from './AIDocumentVerification';
import { LandSearchRequestComponent } from './LandSearchRequest';
import { ValuationRequestComponent } from './ValuationRequest';
import { Listing } from '../../../types';

type VerificationTab = 'documents' | 'land-search' | 'valuation';

interface VerificationCenterProps {
    userId: string;
    userProperties?: Listing[];
    onClose?: () => void;
}

export const VerificationCenter: React.FC<VerificationCenterProps> = ({ userId, userProperties, onClose }) => {
    const [activeTab, setActiveTab] = useState<VerificationTab>('documents');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verification Center</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Verify documents, request land searches, and get property valuations</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'documents'
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                AI Document Verification
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('land-search')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'land-search'
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Request Land Search
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab('valuation')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'valuation'
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Request Valuation
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'documents' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Document Verification</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Upload property documents for AI-powered verification and data extraction.</p>

                        <AIDocumentVerification userId={userId} />
                    </div>
                )}

                {activeTab === 'land-search' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Request Land Search</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Submit a land search request with parcel number and location details.</p>

                        <LandSearchRequestComponent userId={userId} />
                    </div>
                )}

                {activeTab === 'valuation' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Request Valuation</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Request a professional property valuation with supporting documents.</p>

                        <ValuationRequestComponent userId={userId} userProperties={userProperties} />
                    </div>
                )}
            </div>
        </div>
    );
};
