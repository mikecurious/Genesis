import React, { useState, useEffect } from 'react';
import { User } from '../../../types';

interface AgentProfileSettingsProps {
    user: User;
}

export const AgentProfileSettings: React.FC<AgentProfileSettingsProps> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [bio, setBio] = useState('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [yearsOfExperience, setYearsOfExperience] = useState(0);
    const [serviceAreas, setServiceAreas] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [certifications, setCertifications] = useState<string[]>([]);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [companyCertification, setCompanyCertification] = useState('');

    // Temporary input states for adding items to arrays
    const [newServiceArea, setNewServiceArea] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [newCertification, setNewCertification] = useState('');
    const [newAchievement, setNewAchievement] = useState('');

    const availableSpecializations = [
        'Residential Sales',
        'Residential Rentals',
        'Commercial Sales',
        'Commercial Rentals',
        'Land Sales',
        'Property Management',
        'Investment Properties',
        'Luxury Properties'
    ];

    useEffect(() => {
        // Load existing profile data
        if (user.agentProfile) {
            setProfileImage(user.agentProfile.profileImage || null);
            setBio(user.agentProfile.bio || '');
            setSpecializations(user.agentProfile.specializations || []);
            setYearsOfExperience(user.agentProfile.yearsOfExperience || 0);
            setServiceAreas(user.agentProfile.serviceAreas || []);
            setLanguages(user.agentProfile.languages || []);
            setCertifications(user.agentProfile.certifications || []);
            setAchievements(user.agentProfile.achievements || []);
            setCompanyCertification(user.agentProfile.companyCertification || '');
        }
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setProfileImage(data.data.profileImage);
                alert('Profile image uploaded successfully!');
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image');
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    bio,
                    specializations,
                    yearsOfExperience,
                    serviceAreas,
                    languages,
                    certifications,
                    achievements,
                    companyCertification
                })
            });

            const data = await response.json();
            if (data.success) {
                setIsEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSpecialization = (spec: string) => {
        setSpecializations(prev =>
            prev.includes(spec)
                ? prev.filter(s => s !== spec)
                : [...prev, spec]
        );
    };

    const addServiceArea = () => {
        if (newServiceArea.trim() && !serviceAreas.includes(newServiceArea.trim())) {
            setServiceAreas([...serviceAreas, newServiceArea.trim()]);
            setNewServiceArea('');
        }
    };

    const addLanguage = () => {
        if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
            setLanguages([...languages, newLanguage.trim()]);
            setNewLanguage('');
        }
    };

    const addCertification = () => {
        if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
            setCertifications([...certifications, newCertification.trim()]);
            setNewCertification('');
        }
    };

    const addAchievement = () => {
        if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
            setAchievements([...achievements, newAchievement.trim()]);
            setNewAchievement('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Profile</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Image */}
            <div className="mb-6 text-center">
                <div className="relative inline-block">
                    <img
                        src={profileImage ? `${import.meta.env.VITE_API_URL}${profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=6366f1&color=fff`}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-800"
                    />
                    {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{user.role}</p>
            </div>

            {/* Bio */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Professional Bio
                </label>
                {isEditing ? (
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Tell potential clients about your experience and expertise..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    <p className="text-gray-700 dark:text-gray-300">{bio || 'No bio added yet.'}</p>
                )}
            </div>

            {/* Years of Experience */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Years of Experience
                </label>
                {isEditing ? (
                    <input
                        type="number"
                        min="0"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    <p className="text-gray-700 dark:text-gray-300">{yearsOfExperience} years</p>
                )}
            </div>

            {/* Specializations */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Specializations
                </label>
                {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                        {availableSpecializations.map((spec) => (
                            <label key={spec} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={specializations.includes(spec)}
                                    onChange={() => toggleSpecialization(spec)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">{spec}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {specializations.length > 0 ? (
                            specializations.map((spec) => (
                                <span
                                    key={spec}
                                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                                >
                                    {spec}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No specializations selected.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Service Areas */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Service Areas / Locations
                </label>
                {isEditing && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newServiceArea}
                            onChange={(e) => setNewServiceArea(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                            placeholder="e.g., Westlands, Kilimani"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={addServiceArea}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Add
                        </button>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-2"
                        >
                            {area}
                            {isEditing && (
                                <button
                                    onClick={() => setServiceAreas(serviceAreas.filter((_, i) => i !== idx))}
                                    className="text-green-900 dark:text-green-200 hover:text-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                    {serviceAreas.length === 0 && <p className="text-gray-500 dark:text-gray-400">No service areas added.</p>}
                </div>
            </div>

            {/* Languages */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Languages
                </label>
                {isEditing && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                            placeholder="e.g., English, Swahili"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={addLanguage}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Add
                        </button>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {languages.map((lang, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                        >
                            {lang}
                            {isEditing && (
                                <button
                                    onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                                    className="text-blue-900 dark:text-blue-200 hover:text-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                    {languages.length === 0 && <p className="text-gray-500 dark:text-gray-400">No languages added.</p>}
                </div>
            </div>

            {/* Certifications */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Certifications
                </label>
                {isEditing && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newCertification}
                            onChange={(e) => setNewCertification(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                            placeholder="e.g., Licensed Real Estate Agent"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={addCertification}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Add
                        </button>
                    </div>
                )}
                <div className="space-y-2">
                    {certifications.map((cert, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <span className="text-gray-700 dark:text-gray-300">{cert}</span>
                            {isEditing && (
                                <button
                                    onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    {certifications.length === 0 && <p className="text-gray-500 dark:text-gray-400">No certifications added.</p>}
                </div>
            </div>

            {/* Achievements */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Achievements & Awards
                </label>
                {isEditing && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newAchievement}
                            onChange={(e) => setNewAchievement(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                            placeholder="e.g., Top Performer 2024"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={addAchievement}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Add
                        </button>
                    </div>
                )}
                <div className="space-y-2">
                    {achievements.map((achievement, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                            {isEditing && (
                                <button
                                    onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    {achievements.length === 0 && <p className="text-gray-500 dark:text-gray-400">No achievements added.</p>}
                </div>
            </div>

            {/* Company Certification */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Company / Agency Certification
                </label>
                {isEditing ? (
                    <input
                        type="text"
                        value={companyCertification}
                        onChange={(e) => setCompanyCertification(e.target.value)}
                        placeholder="e.g., Certified with XYZ Real Estate Agency"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    <p className="text-gray-700 dark:text-gray-300">{companyCertification || 'No company certification added.'}</p>
                )}
            </div>

            {/* Stats (Read-only) */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{user.agentProfile?.rating || 5.0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{user.agentProfile?.totalDeals || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Deals</p>
                </div>
            </div>
        </div>
    );
};
