import React from 'react';
import { type Listing } from '../types';
import { AgentIcon } from './icons/AgentIcon';
import { formatPrice } from '../utils/formatPrice';

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
        <div className="group relative w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 flex flex-col h-full transform hover:-translate-y-2">
            {/* Image Section - Horizontal Carousel */}
            <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => onImageClick?.()}>
                {/* Current Image */}
                <div className="relative w-full h-full">
                    <img
                        src={images[currentImageIndex]}
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-500" />

                    {/* Price Tag */}
                    <div className="absolute top-5 left-5 flex flex-col gap-2.5 items-start">
                        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl px-5 py-2 rounded-2xl shadow-2xl shadow-black/20 border border-white/20 dark:border-gray-700/50 transform hover:scale-105 transition-transform duration-300">
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xl tracking-tight">{formatPrice(property.price)}</span>
                        </div>
                        <div className={`px-4 py-1.5 rounded-2xl shadow-xl backdrop-blur-xl text-xs font-bold text-white border border-white/30 transform hover:scale-105 transition-all duration-300 ${property.priceType === 'sale' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-cyan-600'}`}>
                            {property.priceType === 'sale' ? '🏷️ For Sale' : '📍 For Rent'}
                        </div>
                    </div>

                    {/* AI Investment Badge */}
                    {property.investment?.badge && (
                        <div className="absolute top-5 right-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl shadow-amber-500/30 animate-pulse border border-white/30 backdrop-blur-xl flex items-center gap-1.5 transform hover:scale-105 transition-transform duration-300">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white p-3 rounded-full transition-all shadow-2xl opacity-0 group-hover:opacity-100 z-10 border border-white/30 transform hover:scale-110"
                            aria-label="Previous image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white p-3 rounded-full transition-all shadow-2xl opacity-0 group-hover:opacity-100 z-10 border border-white/30 transform hover:scale-110"
                            aria-label="Next image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/30 backdrop-blur-xl px-3 py-2 rounded-full border border-white/20">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                    className={`h-2 rounded-full transition-all ${idx === currentImageIndex
                                            ? 'bg-white w-8 shadow-lg shadow-white/50'
                                            : 'bg-white/50 hover:bg-white/75 w-2'
                                        }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Content Section */}
            <div className="p-7 flex flex-col flex-grow bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/30">
                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow overflow-y-auto custom-scrollbar max-h-24 pr-2">
                    {property.description}
                </div>

                {/* Agent Info & ROI */}
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-200/70 dark:border-gray-700/70">
                    <div className="flex items-center gap-3 group/agent">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover/agent:scale-110 transition-transform duration-300 border border-white/20">
                            <AgentIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover/agent:text-indigo-600 dark:group-hover/agent:text-indigo-400 transition-colors">{property.agentName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Listing Agent</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {property.investment && (
                            <div className="text-right hidden sm:block mr-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl border border-green-200/50 dark:border-green-700/50">
                                <p className="text-[10px] uppercase tracking-wider text-green-700 dark:text-green-400 font-semibold">ROI</p>
                                <p className="text-base font-extrabold text-green-600 dark:text-green-400">{property.investment.roi}%</p>
                            </div>
                        )}

                        {/* Edit/Delete Buttons */}
                        {(onEdit || onDelete) && (
                            <div className="flex items-center gap-1">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(property)}
                                        className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-105"
                                        title="Edit Listing"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(property)}
                                        className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-105"
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
                                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 flex items-center gap-2 group/btn border border-white/20"
                            >
                                <span className="relative z-10">Connect</span>
                                <svg className="w-4 h-4 relative z-10 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
