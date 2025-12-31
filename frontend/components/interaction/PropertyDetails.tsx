
import React, { useState } from 'react';
import { type Listing } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface PropertyDetailsProps {
    property: Listing;
    onOpenImageViewer: (images: string[], startIndex?: number) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onOpenImageViewer }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirstSlide = currentImageIndex === 0;
        const newIndex = isFirstSlide ? property.imageUrls.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLastSlide = currentImageIndex === property.imageUrls.length - 1;
        const newIndex = isLastSlide ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-700/50">
            <div className="relative group mb-4">
                <button onClick={() => onOpenImageViewer(property.imageUrls, currentImageIndex)} className="w-full aspect-video block rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500">
                    <img 
                        src={property.imageUrls[currentImageIndex]} 
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </button>
                {property.imageUrls.length > 1 && (
                     <>
                        <button 
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button 
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                            {currentImageIndex + 1} / {property.imageUrls.length}
                        </div>
                    </>
                )}
            </div>
            <div className="px-1">
                <h1 className="text-xl md:text-2xl font-bold">{property.title}</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{property.location}</p>
                <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mt-3">{property.price}</p>

                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                <h2 className="text-lg font-semibold mb-2">About this property</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{property.description}</p>
            </div>
        </div>
    );
};