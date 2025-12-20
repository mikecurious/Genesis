import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface SurveyorProfileProps {
    user: User;
}

interface Service {
    name: string;
    description: string;
    price: number;
}

export const SurveyorProfile: React.FC<SurveyorProfileProps> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [bio, setBio] = useState('');
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [yearsOfExperience, setYearsOfExperience] = useState(0);
    const [certifications, setCertifications] = useState<string[]>([]);
    const [availability, setAvailability] = useState('Available');
    const [location, setLocation] = useState('');

    const availableSpecializations = [
        'Residential',
        'Commercial',
        'Land',
        'Industrial',
        'Agricultural',
        'Mixed-Use'
    ];

    useEffect(() => {
        // Load existing profile data
        if (user.surveyorProfile) {
            setProfileImage(user.surveyorProfile.profileImage || null);
            setBio(user.surveyorProfile.bio || '');
            setSpecializations(user.surveyorProfile.specializations || []);
            setServices(user.surveyorProfile.services || []);
            setYearsOfExperience(user.surveyorProfile.yearsOfExperience || 0);
            setCertifications(user.surveyorProfile.certifications || []);
            setAvailability(user.surveyorProfile.availability || 'Available');
            setLocation(user.surveyorProfile.location || '');
        }
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await fetch('/api/surveyor/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setProfileImage(data.data.profileImage);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image');
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/surveyor/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    bio,
                    specializations,
                    services,
                    yearsOfExperience,
                    certifications,
                    availability,
                    location
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

    const addService = () => {
        setServices([...services, { name: '', description: '', price: 0 }]);
    };

    const updateService = (index: number, field: keyof Service, value: string | number) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const removeService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Surveyor Profile</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your professional profile and services</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Image</h3>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>
                    {isEditing && (
                        <div>
                            <label className="cursor-pointer bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors inline-block">
                                Upload New Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or WebP. Max 5MB.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bio</h3>
                {isEditing ? (
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Tell clients about your experience and expertise..."
                    />
                ) : (
                    <p className="text-gray-700 dark:text-gray-300">{bio || 'No bio added yet'}</p>
                )}
            </div>

            {/* Specializations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specializations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSpecializations.map(spec => (
                        <label
                            key={spec}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${specializations.includes(spec)
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                } ${!isEditing ? 'pointer-events-none' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={specializations.includes(spec)}
                                onChange={() => toggleSpecialization(spec)}
                                disabled={!isEditing}
                                className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{spec}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Services */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services & Pricing</h3>
                    {isEditing && (
                        <button
                            onClick={addService}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                        >
                            + Add Service
                        </button>
                    )}
                </div>
                <div className="space-y-4">
                    {services.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No services added yet</p>
                    ) : (
                        services.map((service, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={service.name}
                                            onChange={(e) => updateService(index, 'name', e.target.value)}
                                            placeholder="Service name"
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                                        />
                                        <textarea
                                            value={service.description}
                                            onChange={(e) => updateService(index, 'description', e.target.value)}
                                            placeholder="Description"
                                            rows={2}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={service.price}
                                                onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                                                placeholder="Price (KSh)"
                                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                                            />
                                            <button
                                                onClick={() => removeService(index)}
                                                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">KSh {service.price.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Experience</h3>
                    {isEditing ? (
                        <input
                            type="number"
                            value={yearsOfExperience}
                            onChange={(e) => setYearsOfExperience(parseInt(e.target.value))}
                            min="0"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                        />
                    ) : (
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{yearsOfExperience} years</p>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>
                    {isEditing ? (
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Nairobi, Kenya"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                        />
                    ) : (
                        <p className="text-gray-700 dark:text-gray-300">{location || 'Not specified'}</p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm">Rating</p>
                            <p className="text-3xl font-bold mt-1">{user.surveyorProfile?.rating || 5.0}</p>
                        </div>
                        <svg className="w-12 h-12 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Completed Surveys</p>
                            <p className="text-3xl font-bold mt-1">{user.surveyorProfile?.completedSurveys || 0}</p>
                        </div>
                        <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm">Availability</p>
                            {isEditing ? (
                                <select
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    className="mt-1 bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm"
                                >
                                    <option value="Available">Available</option>
                                    <option value="Busy">Busy</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                            ) : (
                                <p className="text-2xl font-bold mt-1">{availability}</p>
                            )}
                        </div>
                        <svg className="w-12 h-12 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
