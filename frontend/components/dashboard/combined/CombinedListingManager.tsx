
import React from 'react';
import { type Listing } from '../../../types';
import { formatPrice } from '../../../utils/formatPrice';

interface CombinedListingManagerProps {
    listings: Listing[];
    onOpenAddListingModal: () => void;
}

export const CombinedListingManager: React.FC<CombinedListingManagerProps> = ({ listings, onOpenAddListingModal }) => {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Properties ({listings.length})</h2>
                <button
                    onClick={onOpenAddListingModal}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    + Add New Listing
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Location</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.length > 0 ? listings.map(listing => (
                            <tr key={listing.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{listing.title}</th>
                                <td className="px-6 py-4">{listing.location}</td>
                                <td className="px-6 py-4">{formatPrice(listing.price, listing.currency)}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Edit</a>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">You have no active listings.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};