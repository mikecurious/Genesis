import React, { useState } from 'react';

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilters) => void;
    onClear: () => void;
}

export interface SearchFilters {
    priceMin?: number;
    priceMax?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    location?: string;
    investmentScoreMin?: number;
    recentlyAdded?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleAmenityToggle = (amenity: string) => {
        const current = filters.amenities || [];
        const updated = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];
        setFilters(prev => ({ ...prev, amenities: updated }));
    };

    const handleSearch = () => {
        onSearch(filters);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        onClear();
        setIsOpen(false);
    };

    const activeFilterCount = Object.keys(filters).filter(key => {
        const value = filters[key as keyof SearchFilters];
        return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    }).length;

    return (
        <div className="relative">
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Advanced Filters</span>
                {activeFilterCount > 0 && (
                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price Range (KSh)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin || ''}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax || ''}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Property Type
                                </label>
                                <select
                                    value={filters.propertyType || ''}
                                    onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="house">House</option>
                                    <option value="studio">Studio</option>
                                    <option value="penthouse">Penthouse</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            {/* Bedrooms & Bathrooms */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bedrooms
                                    </label>
                                    <select
                                        value={filters.bedrooms || ''}
                                        onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Any</option>
                                        <option value="1">1+</option>
                                        <option value="2">2+</option>
                                        <option value="3">3+</option>
                                        <option value="4">4+</option>
                                        <option value="5">5+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bathrooms
                                    </label>
                                    <select
                                        value={filters.bathrooms || ''}
                                        onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Any</option>
                                        <option value="1">1+</option>
                                        <option value="2">2+</option>
                                        <option value="3">3+</option>
                                        <option value="4">4+</option>
                                    </select>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amenities
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Elevator'].map(amenity => (
                                        <button
                                            key={amenity}
                                            onClick={() => handleAmenityToggle(amenity.toLowerCase())}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.amenities?.includes(amenity.toLowerCase())
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Investment Score */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Investment Score
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={filters.investmentScoreMin || 0}
                                    onChange={(e) => handleFilterChange('investmentScoreMin', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <span>0</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        {filters.investmentScoreMin || 0}
                                    </span>
                                    <span>100</span>
                                </div>
                            </div>

                            {/* Recently Added */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Recently Added
                                </label>
                                <select
                                    value={filters.recentlyAdded || ''}
                                    onChange={(e) => handleFilterChange('recentlyAdded', e.target.value || undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Any Time</option>
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleClearFilters}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
