import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface ImageViewerProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const ImageViewer: React.FC<ImageViewerProps> = ({ images, startIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const touchStartX = useRef(0);

    const goToPrevious = useCallback(() => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);

    const goToNext = useCallback(() => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, images.length]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious();
            } else if (event.key === 'ArrowRight') {
                goToNext();
            } else if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrevious, goToNext, onClose]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === 0) return;
        const touchEndX = e.touches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (diff > 50) { // Swipe left
            goToNext();
            touchStartX.current = 0;
        }

        if (diff < -50) { // Swipe right
            goToPrevious();
            touchStartX.current = 0;
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-fade-in-up" 
            style={{animationDuration: '0.3s'}}
            onClick={onClose}
        >
            <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close image viewer"
            >
                <CloseIcon />
            </button>
            
            {images.length > 1 && (
                <>
                    <button 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/30 p-2 rounded-full transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                        aria-label="Previous image"
                    >
                        <ChevronLeftIcon className="h-8 w-8" />
                    </button>
                    <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/30 p-2 rounded-full transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        aria-label="Next image"
                    >
                        <ChevronRightIcon className="h-8 w-8" />
                    </button>
                </>
            )}

            <div 
              className="relative w-full h-full flex items-center justify-center p-4 md:p-16"
              onClick={e => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
                <img 
                    src={images[currentIndex]} 
                    alt={`Property image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>
            
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};