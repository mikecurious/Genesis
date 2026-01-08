import React from 'react';
import { ActionCard } from './ActionCard';
import { Listing } from '../../types';
import { notificationService } from '../../services/notificationService';

interface PropertyActionsSectionProps {
    property: Listing;
    onOpenMortgage: () => void;
    onOpenValuation: () => void;
    onOpenVerification: () => void;
    onOpenLandSearch: () => void;
    onScheduleViewing: () => void;
}

export const PropertyActionsSection: React.FC<PropertyActionsSectionProps> = ({
    property,
    onOpenMortgage,
    onOpenValuation,
    onOpenVerification,
    onOpenLandSearch,
    onScheduleViewing
}) => {
    const hasDocuments = Boolean(property.documentsUploaded);
    const requireDocuments = (action: () => void) => {
        if (!hasDocuments) {
            notificationService.error('Upload property documents to unlock this feature.');
            return;
        }
        action();
    };

    return (
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    What would you like to do?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Explore financing, valuation, and verification options for this property
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Calculate Mortgage"
                    description="See monthly payments and compare bank offers"
                    onClick={() => requireDocuments(onOpenMortgage)}
                    disabled={!hasDocuments}
                    color="green"
                    badge="Popular"
                />

                <ActionCard
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    title="Get Valuation"
                    description="AI estimate or professional valuation report"
                    onClick={onOpenValuation}
                    color="blue"
                />

                <ActionCard
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Request Verification"
                    description="Verify documents and ownership"
                    onClick={() => requireDocuments(onOpenVerification)}
                    disabled={!hasDocuments}
                    color="purple"
                />

                <ActionCard
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
                    title="Find Similar Land"
                    description="Search nearby land parcels"
                    onClick={onOpenLandSearch}
                    color="orange"
                />

                <ActionCard
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                    title="Schedule Viewing"
                    description="Book a surveyor site visit"
                    onClick={() => requireDocuments(onScheduleViewing)}
                    disabled={!hasDocuments}
                    color="indigo"
                    badge="New"
                />

                <ActionCard
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                    title="Chat with AI"
                    description="Ask questions about this property"
                    onClick={() => {/* Will integrate with chat */ }}
                    color="indigo"
                />
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Need help deciding?
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Our AI assistant can guide you through the process and answer any questions about financing, verification, or this property.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
