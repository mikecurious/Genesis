import React from 'react';

export interface SurveyorData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    surveyorProfile?: {
        profileImage?: string;
        bio?: string;
        specializations?: string[];
        services?: Array<{
            name: string;
            description: string;
            price: number;
            currency: string;
        }>;
        yearsOfExperience?: number;
        location?: string;
        rating?: number;
        completedSurveys?: number;
        availability?: string;
    };
}

interface SurveyorCardProps {
    surveyor: SurveyorData;
    onConnect: (surveyor: SurveyorData) => void;
}

export const SurveyorCard: React.FC<SurveyorCardProps> = ({ surveyor, onConnect }) => {
    const profile = surveyor.surveyorProfile;

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                {/* Header with Image and Basic Info */}
                <div className="flex items-start gap-4 mb-4">
                    <img
                        src={profile?.profileImage
                            ? `${import.meta.env.VITE_API_URL}${profile.profileImage}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(surveyor.name)}&size=200&background=f59e0b&color=fff`}
                        alt={surveyor.name}
                        className="w-20 h-20 rounded-full border-4 border-amber-200 dark:border-amber-800 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {surveyor.name}
                        </h3>
                        {profile?.location && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {profile.location}
                            </p>
                        )}
                        {profile?.rating && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(profile.rating!) ? 'fill-current' : 'fill-gray-300 dark:fill-gray-600'}`} viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {profile.rating.toFixed(1)}
                                </span>
                                {profile.completedSurveys !== undefined && (
                                    <span className="text-sm text-gray-500 dark:text-gray-500">
                                        • {profile.completedSurveys} surveys
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {profile?.availability && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            profile.availability === 'available'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                            {profile.availability === 'available' ? 'Available' : 'Busy'}
                        </span>
                    )}
                </div>

                {/* Bio */}
                {profile?.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {profile.bio}
                    </p>
                )}

                {/* Specializations */}
                {profile?.specializations && profile.specializations.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {profile.specializations.slice(0, 3).map((spec, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs"
                                >
                                    {spec}
                                </span>
                            ))}
                            {profile.specializations.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                    +{profile.specializations.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Experience & Price Range */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {profile?.yearsOfExperience !== undefined && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {profile.yearsOfExperience} years
                            </p>
                        </div>
                    )}
                    {profile?.services && profile.services.length > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                {profile.services[0].currency} {profile.services[0].price.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Connect Button */}
                <button
                    onClick={() => onConnect(surveyor)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    View Full Profile
                </button>
            </div>
        </div>
    );
};
