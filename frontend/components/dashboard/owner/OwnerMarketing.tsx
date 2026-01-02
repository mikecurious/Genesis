
import React, { useState } from 'react';
import { type Listing } from '../../../types';
import { MpesaPaymentModal } from '../../modals/MpesaPaymentModal';
import { propertyService } from '../../../services/apiService';
import type { Payment } from '../../../services/paymentService';

interface OwnerMarketingProps {
    listings: Listing[];
}

export const OwnerMarketing: React.FC<OwnerMarketingProps> = ({ listings }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    const handleBoostClick = (listing: Listing) => {
        setSelectedListing(listing);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (payment: Payment) => {
        if (selectedListing) {
            try {
                await propertyService.boostProperty(selectedListing.id, payment._id);
                console.log(`✅ Property boosted successfully: ${selectedListing.title}`);
                alert(`Success! Your property "${selectedListing.title}" is now boosted.`);
            } catch (error: any) {
                console.error('Failed to boost property:', error);
                alert(`Payment processed but failed to boost property. Please contact support. Payment ID: ${payment._id}`);
            }
        }
        setIsPaymentModalOpen(false);
        setSelectedListing(null);
    };

    const handlePaymentFailed = () => {
        console.log('Payment failed or cancelled');
        setIsPaymentModalOpen(false);
        setSelectedListing(null);
    };
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-1">Boost Your Property</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Promote your listings to get higher visibility and attract more clients.</p>
            <div className="space-y-4">
                {listings.length > 0 ? listings.map(listing => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{listing.location}</p>
                        </div>
                        <button
                            onClick={() => handleBoostClick(listing)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            Boost Property
                        </button>
                    </div>
                )) : (
                     <div className="text-center py-8 text-gray-500">You have no listings to market. Add a listing first.</div>
                )}
            </div>

            {selectedListing && (
                <MpesaPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={handlePaymentSuccess}
                    onFailed={handlePaymentFailed}
                    amount={6000}
                    description={`Boost Property: ${selectedListing.title}`}
                    paymentType="service"
                    metadata={{
                        propertyId: selectedListing.id,
                        propertyTitle: selectedListing.title,
                        action: 'boost_property'
                    }}
                />
            )}
        </div>
    );
};