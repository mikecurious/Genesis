import React from 'react';
import type { SurveyorData } from './SurveyorCard';

interface SurveyorDetailPageProps {
    surveyor: SurveyorData;
    onBack: () => void;
}

export const SurveyorDetailPage: React.FC<SurveyorDetailPageProps> = ({ surveyor, onBack }) => {
    const profile = surveyor.surveyorProfile;

    const handleCall = () => {
        if (surveyor.phone) {
            const cleanPhone = surveyor.phone.replace(/[^0-9+]/g, '');
            window.location.href = `tel:${cleanPhone}`;
        } else {
            alert('Phone number not available');
        }
    };

    const handleWhatsApp = () => {
        if (surveyor.whatsappNumber) {
            const cleanWhatsapp = surveyor.whatsappNumber.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanWhatsapp}`, '_blank');
        } else {
            alert('WhatsApp number not available');
        }
    };

    const handleEmail = () => {
        if (surveyor.email) {
            const subject = encodeURIComponent(`Inquiry about surveyor services`);
            const body = encodeURIComponent(
                `Hi ${surveyor.name},\n\n` +
                `I found your profile and I'm interested in your surveyor services.\n\n` +
                `Please contact me with more details about availability and pricing.\n\n` +
                `Best regards`
            );
            window.location.href = `mailto:${surveyor.email}?subject=${subject}&body=${body}`;
        } else {
            alert('Email address not available');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Profile Header */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
                                <div className="flex items-start gap-6">
                                    <img
                                        src={profile?.profileImage
                                            ? `${import.meta.env.VITE_API_URL}${profile.profileImage}`
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(surveyor.name)}&size=200&background=f59e0b&color=fff`}
                                        alt={surveyor.name}
                                        className="w-32 h-32 rounded-full border-4 border-amber-200 dark:border-amber-800 object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {surveyor.name}
                                                </h1>
                                                {profile?.location && (
                                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {profile.location}
                                                    </p>
                                                )}
                                            </div>
                                            {profile?.availability && (
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                                    profile.availability === 'available'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                    {profile.availability === 'available' ? 'Available Now' : 'Currently Busy'}
                                                </span>
                                            )}
                                        </div>

                                        {profile?.rating && (
                                            <div className="flex items-center gap-3 mt-4">
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(profile.rating!) ? 'fill-current' : 'fill-gray-300 dark:fill-gray-600'}`} viewBox="0 0 20 20">
                                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {profile.rating.toFixed(1)}
                                                </span>
                                                {profile.completedSurveys !== undefined && (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        ({profile.completedSurveys} completed surveys)
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {profile?.yearsOfExperience !== undefined && (
                                            <p className="text-gray-700 dark:text-gray-300 mt-3">
                                                <span className="font-semibold">{profile.yearsOfExperience}</span> years of professional experience
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            {profile?.bio && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}

                            {/* Specializations */}
                            {profile?.specializations && profile.specializations.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Specializations</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {profile.specializations.map((spec, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services */}
                            {profile?.services && profile.services.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Services & Pricing</h2>
                                    <div className="space-y-4">
                                        {profile.services.map((service, idx) => (
                                            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                                                    </div>
                                                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400 ml-4">
                                                        {service.currency} {service.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Right */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Surveyor</h2>

                                <div className="space-y-3">
                                    {surveyor.phone && (
                                        <button
                                            onClick={handleCall}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Call Now
                                        </button>
                                    )}

                                    {surveyor.whatsappNumber && (
                                        <button
                                            onClick={handleWhatsApp}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            WhatsApp
                                        </button>
                                    )}

                                    {surveyor.email && (
                                        <button
                                            onClick={handleEmail}
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Email Surveyor
                                        </button>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                    {surveyor.email && (
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="text-sm text-gray-900 dark:text-white break-all">{surveyor.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {surveyor.phone && (
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                                <p className="text-sm text-gray-900 dark:text-white">{surveyor.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
