
import React from 'react';
import { type Listing } from '../../../types';
import { PropertyCard } from '../../PropertyCard';

interface OwnerListingManagerProps {
    listings: Listing[];
    onOpenAddListingModal: () => void;
    onEditListing?: (propertyId: string, updatedData: Partial<Omit<Listing, 'id' | 'imageUrls'>>) => Promise<void>;
    onDeleteListing?: (propertyId: string) => Promise<void>;
}

export const OwnerListingManager: React.FC<OwnerListingManagerProps> = ({
    listings,
    onOpenAddListingModal,
    onEditListing,
    onDeleteListing
}) => {
    const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

    const handleEdit = async (listing: Listing) => {
        if (!onEditListing) {
            alert('Edit feature not available');
            return;
        }

        // For now, show a simple prompt to edit the title
        // In a real app, this would open a modal with a form
        const newTitle = prompt('Edit property title:', listing.title);
        if (newTitle && newTitle !== listing.title) {
            try {
                await onEditListing(listing.id, { title: newTitle });
            } catch (error) {
                console.error('Edit failed:', error);
            }
        }
    };

    const handleDelete = async (listing: Listing) => {
        if (!onDeleteListing) {
            alert('Delete feature not available');
            return;
        }

        if (confirm(`Are you sure you want to delete "${listing.title}"?`)) {
            try {
                setIsDeleting(listing.id);
                await onDeleteListing(listing.id);
            } catch (error) {
                console.error('Delete failed:', error);
            } finally {
                setIsDeleting(null);
            }
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Properties</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your active listings</p>
                </div>
                <button
                    onClick={onOpenAddListingModal}
                    className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add New Listing
                </button>
            </div>

            {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map(listing => (
                        <div key={listing.id} className="h-full">
                            <PropertyCard
                                property={listing}
                                onConnect={() => { }}
                                onImageClick={() => { }}
                                showConnectButton={false}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No properties yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first property listing.</p>
                    <button
                        onClick={onOpenAddListingModal}
                        className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                    >
                        Create a listing
                    </button>
                </div>
            )}
        </div>
    );
};