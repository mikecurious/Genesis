import React from 'react';
import { type Listing } from '../types';
import { AgentIcon } from './icons/AgentIcon';

interface PropertyCardProps {
    property: Listing;
    onConnect?: (property: Listing) => void;
    onImageClick?: () => void;
    onEdit?: (property: Listing) => void;
    onDelete?: (property: Listing) => void;
    showConnectButton?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    onConnect,
    onImageClick,
    onEdit,
    onDelete,
    showConnectButton = true
}) => {
    const images = property.imageUrls.length > 0
        ? property.imageUrls
        : [`https://picsum.photos/seed/${encodeURIComponent(property.title)}/800/600`];

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="group relative w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            {/* Image Section - Horizontal Carousel */}
            <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => onImageClick?.()}>
                {/* Current Image */}
                <div className="relative w-full h-full">
                    <img
                        src={images[currentImageIndex]}
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Price Tag */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{property.price}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full shadow-lg backdrop-blur-md text-xs font-bold text-white ${property.priceType === 'sale' ? 'bg-emerald-500/90' : 'bg-blue-500/90'}`}>
                            {property.priceType === 'sale' ? 'For Sale' : 'For Rent'}
                        </div>
                    </div>

                    {/* AI Investment Badge */}
                    {property.investment?.badge && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse border border-white/20 backdrop-blur-md flex items-center gap-1">
                            <span>{property.investment.badge}</span>
                        </div>
                    )}

                    {/* Title & Location Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer">
                        <h3 className="text-2xl font-bold mb-1 drop-shadow-md truncate">{property.title}</h3>
                        <p className="text-gray-200 text-sm flex items-center gap-1 drop-shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {property.location}
                        </p>
                        {onImageClick && (
                            <p className="text-xs text-gray-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Click to view details
                            </p>
                        )}
                    </div>
                </div>

                {/* Navigation Arrows - Only show if multiple images */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Previous image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Next image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                            ? 'bg-white w-6'
                                            : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow overflow-y-auto custom-scrollbar max-h-24 pr-2">
                    {property.description}
                </div>

                {/* Agent Info & ROI */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                            <AgentIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{property.agentName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Listing Agent</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {property.investment && (
                            <div className="text-right hidden sm:block mr-2">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Proj. ROI</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">{property.investment.roi}%</p>
                            </div>
                        )}

                        {/* Edit/Delete Buttons */}
                        {(onEdit || onDelete) && (
                            <div className="flex items-center gap-1">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(property)}
                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        title="Edit Listing"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(property)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Listing"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Connect Button */}
                        {showConnectButton && (
                            <button
                                onClick={() => onConnect?.(property)}
                                className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex items-center gap-2 group/btn"
                            >
                                <span className="relative z-10">Connect</span>
                                <svg className="w-4 h-4 relative z-10 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
