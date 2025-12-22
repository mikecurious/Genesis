import React, { useState } from 'react';
import { Listing } from '../../types';

interface LandSearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    property: Listing;
}

export const LandSearchPanel: React.FC<LandSearchPanelProps> = ({
    isOpen,
    onClose,
    property
}) => {
    const [radius, setRadius] = useState(5);

    // Mock land parcels
    const landParcels = [
        { lr: 'LR 209/1234', size: '1 acre', price: 'KSh 7M', distance: '2km' },
        { lr: 'LR 209/1235', size: '1.5 acres', price: 'KSh 10M', distance: '3km' },
        { lr: 'LR 209/1236', size: '0.5 acres', price: 'KSh 4.5M', distance: '1.5km' },
        { lr: 'LR 209/1237', size: '2 acres', price: 'KSh 15M', distance: '4km' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                🗺️ Find Similar Land
                            </h3>
                            <p className="text-orange-100 mt-1 text-sm">
                                Near {property.location}
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
                    {/* Search Radius */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Search Radius
                            </label>
                            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {radius} km
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 km</span>
                            <span>20 km</span>
                        </div>
                    </div>

                    {/* Results */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                            Found {landParcels.length} land parcels
                        </h4>
                        <div className="space-y-3">
                            {landParcels.map((parcel) => (
                                <div
                                    key={parcel.lr}
                                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-2 border-transparent hover:border-orange-500"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-bold text-gray-900 dark:text-white">
                                            {parcel.lr}
                                        </h5>
                                        <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                                            {parcel.distance} away
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span>📏 {parcel.size}</span>
                                            <span>💰 {parcel.price}</span>
                                        </div>
                                        <button className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium">
                                            View on Map →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map Button */}
                    <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                        View All on Interactive Map
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
