import React from 'react';
import { type Listing } from '../../../types';

interface AgentMarketingProps {
    listings: Listing[];
    onBoostClick: (listing: Listing) => void;
}

export const AgentMarketing: React.FC<AgentMarketingProps> = ({ listings, onBoostClick }) => {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-1">Marketing Tools</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Promote your listings to get higher visibility and attract more clients.</p>
            <div className="space-y-4">
                {listings.length > 0 ? listings.map(listing => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{listing.location}</p>
                        </div>
                        <button
                            onClick={() => onBoostClick(listing)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            Boost Property
                        </button>
                    </div>
                )) : (
                     <div className="text-center py-8 text-gray-500">You have no listings to market. Add a listing first.</div>
                )}
            </div>
        </div>
    );
};
