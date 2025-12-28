import React, { useState, useEffect } from 'react';
import { Listing } from '../types';
import { formatPrice } from '../utils/formatPrice';

interface PropertyAgentPageProps {
    property: Listing;
    onBack: () => void;
    onChatWithAI?: () => void;
}

interface AgentData {
    name: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    role: string;
    agentProfile?: {
        profileImage?: string;
        bio?: string;
        specializations?: string[];
        yearsOfExperience?: number;
        serviceAreas?: string[];
        languages?: string[];
        certifications?: string[];
        achievements?: string[];
        rating?: number;
        totalDeals?: number;
        companyCertification?: string;
    };
}

export const PropertyAgentPage: React.FC<PropertyAgentPageProps> = ({
    property,
    onBack,
    onChatWithAI
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [agentData, setAgentData] = useState<AgentData | null>(null);
    const [isLoadingAgent, setIsLoadingAgent] = useState(true);

    const images = property.imageUrls && property.imageUrls.length > 0
        ? property.imageUrls
        : [`https://picsum.photos/seed/${encodeURIComponent(property.title)}/800/600`];

    useEffect(() => {
        // Fetch agent profile data
        const fetchAgentData = async () => {
            if (!property.createdBy?._id && !property.createdBy?.id) {
                setIsLoadingAgent(false);
                return;
            }

            const agentId = property.createdBy._id || property.createdBy.id;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/profile/${agentId}`);
                const data = await response.json();

                if (data.success) {
                    setAgentData(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch agent data:', error);
            } finally {
                setIsLoadingAgent(false);
            }
        };

        fetchAgentData();
    }, [property.createdBy]);

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleCall = () => {
        const phone = agentData?.phone || property.createdBy?.phone;
        if (phone) {
            window.location.href = `tel:${phone}`;
        }
    };

    const handleWhatsApp = () => {
        const whatsapp = agentData?.whatsappNumber || property.createdBy?.whatsappNumber;
        if (whatsapp) {
            window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
        }
    };

    const handleEmail = () => {
        const email = agentData?.email || property.createdBy?.email;
        if (email) {
            window.location.href = `mailto:${email}?subject=Inquiry about ${property.title}`;
        }
    };

    const agent = agentData || {
        name: property.createdBy?.name || property.agentName || 'Agent',
        email: property.createdBy?.email || property.agentContact || '',
        phone: property.createdBy?.phone,
        whatsappNumber: property.createdBy?.whatsappNumber,
        role: property.createdBy?.role || 'Agent'
    };

    return (
        <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col pt-16">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-4 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{property.location}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Property Details Section - Left (70%) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                            <div className="relative h-96">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Navigation Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Image Indicators */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                                    ? 'bg-white w-8'
                                                    : 'bg-white/50 hover:bg-white/75'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h2>
                                <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-semibold">
                                    {formatPrice(property.price, property.currency)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{property.location}</span>
                            </div>

                            {property.bedrooms && (
                                <div className="flex gap-6 mb-6 text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Bedrooms:</span>
                                        <span>{property.bedrooms}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Bathrooms:</span>
                                        <span>{property.bathrooms}</span>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {property.description}
                                </p>
                            </div>

                            {property.amenities && property.amenities.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {property.amenities.map((amenity: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat with AI Button */}
                        {onChatWithAI && (
                            <button
                                onClick={onChatWithAI}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat with AI Assistant
                            </button>
                        )}
                    </div>
                </div>

                {/* Agent Profile Section - Right (30%) */}
                <div className="md:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-6">
                    <div className="sticky top-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Agent Information</h2>

                        {isLoadingAgent ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading agent info...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Agent Profile Card */}
                                <div className="text-center">
                                    <img
                                        src={agent.agentProfile?.profileImage
                                            ? `${import.meta.env.VITE_API_URL}${agent.agentProfile.profileImage}`
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&size=200&background=6366f1&color=fff`}
                                        alt={agent.name}
                                        className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-200 dark:border-indigo-800 object-cover"
                                    />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">{agent.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{agent.role}</p>

                                    {agent.agentProfile?.rating && (
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(agent.agentProfile!.rating!) ? 'fill-current' : 'fill-gray-300 dark:fill-gray-600'}`} viewBox="0 0 20 20">
                                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {agent.agentProfile.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                {agent.agentProfile?.bio && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {agent.agentProfile.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Experience */}
                                {agent.agentProfile?.yearsOfExperience !== undefined && agent.agentProfile.yearsOfExperience > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Experience</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {agent.agentProfile.yearsOfExperience} years in real estate
                                        </p>
                                    </div>
                                )}

                                {/* Specializations */}
                                {agent.agentProfile?.specializations && agent.agentProfile.specializations.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Specializations</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.agentProfile.specializations.map((spec, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Service Areas */}
                                {agent.agentProfile?.serviceAreas && agent.agentProfile.serviceAreas.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Service Areas</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {agent.agentProfile.serviceAreas.join(', ')}
                                        </p>
                                    </div>
                                )}

                                {/* Languages */}
                                {agent.agentProfile?.languages && agent.agentProfile.languages.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Languages</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {agent.agentProfile.languages.join(', ')}
                                        </p>
                                    </div>
                                )}

                                {/* Total Deals */}
                                {agent.agentProfile?.totalDeals !== undefined && agent.agentProfile.totalDeals > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {agent.agentProfile.totalDeals}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Successful Deals</p>
                                    </div>
                                )}

                                {/* Contact Buttons */}
                                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Agent</h4>

                                    {agent.phone && (
                                        <button
                                            onClick={handleCall}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Call Agent
                                        </button>
                                    )}

                                    {agent.whatsappNumber && (
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

                                    {agent.email && (
                                        <button
                                            onClick={handleEmail}
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Email Agent
                                        </button>
                                    )}
                                </div>

                                {/* Certifications */}
                                {agent.agentProfile?.certifications && agent.agentProfile.certifications.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Certifications</h4>
                                        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                            {agent.agentProfile.certifications.map((cert, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{cert}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Achievements */}
                                {agent.agentProfile?.achievements && agent.agentProfile.achievements.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Achievements</h4>
                                        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                            {agent.agentProfile.achievements.map((achievement, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span>{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
