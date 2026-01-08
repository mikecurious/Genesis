import React from 'react';

type SurveyorProfileData = {
    name?: string;
    email?: string;
    phone?: string;
    whatsappNumber?: string;
    surveyorProfile?: {
        profileImage?: string;
        bio?: string;
        specializations?: string[];
        services?: { name: string; description?: string; price?: number }[];
        yearsOfExperience?: number;
        certifications?: string[];
        availability?: string;
        rating?: number;
        completedSurveys?: number;
        location?: string;
    };
};

interface SurveyorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    surveyor: SurveyorProfileData | null;
}

export const SurveyorProfileModal: React.FC<SurveyorProfileModalProps> = ({ isOpen, onClose, surveyor }) => {
    if (!isOpen || !surveyor) return null;

    const profile = surveyor.surveyorProfile || {};
    const name = surveyor.name || 'Surveyor';
    const initials = name.trim().charAt(0).toUpperCase();
    const contactEmail = surveyor.email || '';
    const contactPhone = surveyor.phone || '';
    const contactWhatsApp = surveyor.whatsappNumber || '';

    const handleEmail = () => {
        if (!contactEmail) return;
        window.location.href = `mailto:${contactEmail}?subject=Survey Request`;
    };

    const handlePhone = () => {
        if (!contactPhone) return;
        window.location.href = `tel:${contactPhone}`;
    };

    const handleWhatsApp = () => {
        if (!contactWhatsApp) return;
        const digits = contactWhatsApp.replace(/[^0-9]/g, '');
        if (!digits) return;
        window.open(`https://wa.me/${digits}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Surveyor Profile</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xl font-bold text-amber-700 dark:text-amber-200 overflow-hidden">
                            {profile.profileImage ? (
                                <img src={profile.profileImage} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.location || 'Location not specified'}</p>
                            {profile.availability && (
                                <span className="inline-flex mt-2 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                    {profile.availability}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            {profile.rating !== undefined && (
                                <p className="text-sm text-amber-600 dark:text-amber-300">Rating: {profile.rating} ⭐</p>
                            )}
                            {profile.completedSurveys !== undefined && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{profile.completedSurveys} surveys</p>
                            )}
                        </div>
                    </div>

                    {profile.bio && (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {profile.bio}
                        </div>
                    )}

                    {profile.specializations && profile.specializations.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Specializations</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.specializations.map((spec) => (
                                    <span key={spec} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.services && profile.services.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Services</p>
                            <div className="space-y-2">
                                {profile.services.map((service) => (
                                    <div key={service.name} className="flex items-start justify-between text-sm text-gray-700 dark:text-gray-300">
                                        <div>
                                            <p className="font-medium">{service.name}</p>
                                            {service.description && <p className="text-xs text-gray-500 dark:text-gray-400">{service.description}</p>}
                                        </div>
                                        {service.price !== undefined && (
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">KES {service.price}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            onClick={handleEmail}
                            disabled={!contactEmail}
                            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Email
                        </button>
                        <button
                            onClick={handlePhone}
                            disabled={!contactPhone}
                            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Call
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            disabled={!contactWhatsApp}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
