import React from 'react';
import { Listing } from '../types';

interface HeroIntroProps {
  isVisible: boolean;
  listings: Listing[];
  searchMode: 'buy' | 'rent' | 'general';
  onSearchModeChange: (mode: 'buy' | 'rent' | 'general') => void;
}

const PropertyCard: React.FC<{ listing: Listing }> = ({ listing }) => (
  <div className="flex-shrink-0 w-64 h-40 mx-4 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 transition-opacity duration-300">
    <img
      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'}
      alt={listing.title}
      className="w-full h-24 object-cover"
    />
    <div className="p-3">
      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{listing.title}</p>
      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{listing.price}</p>
    </div>
  </div>
);

export const HeroIntro: React.FC<HeroIntroProps> = ({ isVisible, listings, searchMode, onSearchModeChange }) => {
  // Use sample listings if none provided
  const displayListings = (listings && listings.length > 0) ? listings : [
    { id: '1', title: 'Modern Villa', price: '120,000 KSh/mo', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'] },
    { id: '2', title: 'Luxury Apartment', price: '85,000 KSh/mo', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'] },
    { id: '3', title: 'Penthouse Suite', price: '150,000 KSh/mo', images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400'] },
    { id: '4', title: 'Garden Estate', price: '95,000 KSh/mo', images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400'] },
    { id: '5', title: 'Urban Loft', price: '110,000 KSh/mo', images: ['https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400'] },
  ] as Listing[];

  // Duplicate listings for smooth infinite scroll
  const marqueeListings = [...displayListings, ...displayListings, ...displayListings];

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 pointer-events-none ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

      {/* Background Scrolling Marquee */}
      <div className="absolute inset-0 overflow-hidden opacity-20 mask-image-gradient">
        <div className="flex animate-marquee whitespace-nowrap py-10">
          {marqueeListings.map((listing, index) => (
            <PropertyCard key={`${listing.id}-${index}`} listing={listing} />
          ))}
        </div>
        <div className="flex animate-marquee-reverse whitespace-nowrap py-4">
          {marqueeListings.map((listing, index) => (
            <PropertyCard key={`${listing.id}-${index}-rev`} listing={listing} />
          ))}
        </div>
      </div>

      {/* Central Content */}
      <div className="relative z-10 text-center px-4 pointer-events-auto">
        <h1 className={`text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          Real Estate Intelligence
        </h1>

        {/* Search Mode Toggles */}
        <div className={`flex justify-center gap-4 mb-8 transition-all duration-1000 delay-150 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <button
            onClick={() => onSearchModeChange(searchMode === 'buy' ? 'general' : 'buy')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${searchMode === 'buy'
              ? 'bg-indigo-600 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Buy
          </button>
          <button
            onClick={() => onSearchModeChange(searchMode === 'rent' ? 'general' : 'rent')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${searchMode === 'rent'
              ? 'bg-indigo-600 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Rent
          </button>
        </div>

        <p className={`text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {searchMode === 'buy' && "Find your dream home with AI-powered market analysis."}
          {searchMode === 'rent' && "Discover the perfect rental with smart matching."}
          {searchMode === 'general' && "Ask anything about the real estate market."}
        </p>
      </div>

      {/* CSS Animation */}
      <style>{`
        .mask-image-gradient {
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 45s linear infinite;
        }
      `}</style>
    </div>
  );
};
