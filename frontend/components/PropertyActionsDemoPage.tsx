import React, { useState } from 'react';
import { PropertyActionsSection } from './propertyActions/PropertyActionsSection';
import { MortgageCalculatorPanel } from './propertyActions/MortgageCalculatorPanel';
import { ValuationPanel } from './propertyActions/ValuationPanel';
import { VerificationPanel } from './propertyActions/VerificationPanel';
import { LandSearchPanel } from './propertyActions/LandSearchPanel';
import { ScheduleViewingPanel } from './propertyActions/ScheduleViewingPanel';
import { Listing } from '../types';

export const PropertyActionsDemoPage: React.FC = () => {
    const [showMortgagePanel, setShowMortgagePanel] = useState(false);
    const [showValuationPanel, setShowValuationPanel] = useState(false);
    const [showVerificationPanel, setShowVerificationPanel] = useState(false);
    const [showLandSearchPanel, setShowLandSearchPanel] = useState(false);
    const [showScheduleViewingPanel, setShowScheduleViewingPanel] = useState(false);

    // Demo property
    const demoProperty: Listing = {
        id: 'demo-1',
        title: 'Modern 3-Bedroom Apartment in Kilimani',
        description: 'Spacious and modern 3-bedroom apartment with stunning city views, located in the heart of Kilimani. Features include a fully equipped kitchen, master ensuite, ample parking, and 24/7 security.',
        location: 'Kilimani, Nairobi',
        price: 'KSh 8,500,000',
        priceType: 'sale',
        imageUrls: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
        ],
        images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
        ],
        tags: ['Modern', 'Secure', 'Prime Location'],
        agentName: 'Demo Agent',
        agentContact: '+254 700 000 000',
        createdBy: 'demo-user'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Property Actions Demo
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Interactive showcase of all property action features
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Property Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Property Image */}
                        <div className="relative h-64 md:h-auto">
                            <img
                                src={demoProperty.imageUrls[0]}
                                alt={demoProperty.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {demoProperty.price}
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {demoProperty.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {demoProperty.location}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {demoProperty.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {demoProperty.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full text-sm font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Property Actions Section */}
                <PropertyActionsSection
                    property={demoProperty}
                    onOpenMortgage={() => setShowMortgagePanel(true)}
                    onOpenValuation={() => setShowValuationPanel(true)}
                    onOpenVerification={() => setShowVerificationPanel(true)}
                    onOpenLandSearch={() => setShowLandSearchPanel(true)}
                    onScheduleViewing={() => setShowScheduleViewingPanel(true)}
                />

                {/* Feature Highlights */}
                <div className="mt-8 grid md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl mb-3">
                            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                            Mortgage Calculator
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Real-time calculations with bank comparisons and interactive sliders
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl mb-3">
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                            AI Valuation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Instant AI estimates and professional valuation requests
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl mb-3">
                            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                            Verification Services
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Document verification, ownership checks, and legal due diligence
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        How to Use
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                        <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Click any action card above to open the corresponding panel</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Interact with sliders, forms, and buttons to explore features</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>All calculations update in real-time as you adjust parameters</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>These features are now integrated into PropertyExplorerPage for all properties!</span>
                        </li>
                    </ul>
                </div>
            </main>

            {/* All Panels */}
            <MortgageCalculatorPanel
                isOpen={showMortgagePanel}
                onClose={() => setShowMortgagePanel(false)}
                property={demoProperty}
            />

            <ValuationPanel
                isOpen={showValuationPanel}
                onClose={() => setShowValuationPanel(false)}
                property={demoProperty}
            />

            <VerificationPanel
                isOpen={showVerificationPanel}
                onClose={() => setShowVerificationPanel(false)}
                property={demoProperty}
            />

            <LandSearchPanel
                isOpen={showLandSearchPanel}
                onClose={() => setShowLandSearchPanel(false)}
                property={demoProperty}
            />

            <ScheduleViewingPanel
                isOpen={showScheduleViewingPanel}
                onClose={() => setShowScheduleViewingPanel(false)}
                property={demoProperty}
            />
        </div>
    );
};
