import React, { useState } from 'react';
import { type Listing } from '../../types';
import { formatPrice } from '../../utils/formatPrice';

interface PropertyDetailViewProps {
    property: Listing;
    onClose: () => void;
    onEdit?: (property: Listing) => void;
    onDelete?: (property: Listing) => void;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
    property,
    onClose,
    onEdit,
    onDelete
}) => {
    const images = property.imageUrls.length > 0
        ? property.imageUrls
        : [`https://picsum.photos/seed/${encodeURIComponent(property.title)}/800/600`];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl my-8 animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm"
                    aria-label="Close detail view"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image Gallery Section */}
                <div className="relative h-96 overflow-hidden rounded-t-2xl">
                    <img
                        src={images[currentImageIndex]}
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Price & Status Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="bg-white/95 dark:bg-black/85 backdrop-blur-md px-6 py-2 rounded-full shadow-lg">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">{formatPrice(property.price, property.currency)}</span>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md text-sm font-bold text-white ${
                            property.priceType === 'sale' ? 'bg-emerald-500/90' : 'bg-blue-500/90'
                        }`}>
                            {property.priceType === 'sale' ? 'For Sale' : 'For Rent'}
                        </div>
                        <div className="px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md text-sm font-bold bg-gray-900/90 text-white">
                            {property.propertyType || 'Property'}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-8">
                    {/* Title & Location */}
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{property.title}</h1>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-lg">{property.location}</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {property.bedrooms !== undefined && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                                <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.bedrooms}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
                            </div>
                        )}
                        {property.bathrooms !== undefined && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                                <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.bathrooms}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</p>
                            </div>
                        )}
                        {property.area && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                                <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.area}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sq Ft</p>
                            </div>
                        )}
                        {property.investment && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                                <svg className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{property.investment.roi}%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Projected ROI</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {property.description}
                        </p>
                    </div>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {property.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700"
                                    >
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agent Information */}
                    <div className="mb-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Agent Information</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{property.agentName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Listing Agent</p>
                                {property.agentContact && (
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">{property.agentContact}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 min-w-[200px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                            Close
                        </button>
                        {onEdit && (
                            <button
                                onClick={() => {
                                    onEdit(property);
                                    onClose();
                                }}
                                className="flex-1 min-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Property
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => {
                                    onDelete(property);
                                    onClose();
                                }}
                                className="flex-1 min-w-[200px] bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Property
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
