import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Channel {
    enabled: boolean;
    phoneNumber?: string;
    emailAddress?: string;
}

interface InteractionType {
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    channels: string[];
    scoreThreshold?: number;
}

interface RateLimits {
    sms: {
        maxPerHour: number;
        maxPerDay: number;
    };
    whatsapp: {
        maxPerHour: number;
        maxPerDay: number;
    };
}

interface NotificationPreferencesData {
    channels: {
        sms: Channel;
        whatsapp: Channel;
        email: Channel;
        inApp: Channel;
    };
    interactionTypes: {
        leadCaptured: InteractionType;
        emailInquiry: InteractionType;
        highScoreLead: InteractionType;
    };
    rateLimits: RateLimits;
}

interface NotificationPreferencesProps {
    onClose?: () => void;
    standalone?: boolean;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onClose, standalone = true }) => {
    const [preferences, setPreferences] = useState<NotificationPreferencesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'channels' | 'events'>('channels');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/agent-notifications/notification-preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPreferences(response.data.data);
        } catch (error: any) {
            console.error('Failed to load preferences:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load notification preferences'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!preferences) return;

        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/agent-notifications/notification-preferences`,
                preferences,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
        } catch (error: any) {
            console.error('Failed to save preferences:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to save notification preferences'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/agent-notifications/notification-preferences/test`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const results = response.data.data;
            const successChannels = Object.keys(results).filter(ch => results[ch]?.success);

            setMessage({
                type: 'info',
                text: `Test notifications sent! Success: ${successChannels.join(', ') || 'none'}. Check your devices.`
            });
        } catch (error: any) {
            console.error('Failed to send test:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send test notifications'
            });
        } finally {
            setTesting(false);
        }
    };

    const updateChannelEnabled = (channel: 'sms' | 'whatsapp' | 'email' | 'inApp', enabled: boolean) => {
        if (!preferences) return;
        setPreferences({
            ...preferences,
            channels: {
                ...preferences.channels,
                [channel]: { ...preferences.channels[channel], enabled }
            }
        });
    };

    const updateChannelContact = (channel: 'sms' | 'whatsapp' | 'email', field: string, value: string) => {
        if (!preferences) return;
        setPreferences({
            ...preferences,
            channels: {
                ...preferences.channels,
                [channel]: { ...preferences.channels[channel], [field]: value }
            }
        });
    };

    const updateInteractionType = (
        type: 'leadCaptured' | 'emailInquiry' | 'highScoreLead',
        field: string,
        value: any
    ) => {
        if (!preferences) return;
        setPreferences({
            ...preferences,
            interactionTypes: {
                ...preferences.interactionTypes,
                [type]: { ...preferences.interactionTypes[type], [field]: value }
            }
        });
    };

    const toggleInteractionChannel = (
        type: 'leadCaptured' | 'emailInquiry' | 'highScoreLead',
        channel: string
    ) => {
        if (!preferences) return;
        const currentChannels = preferences.interactionTypes[type].channels;
        const newChannels = currentChannels.includes(channel)
            ? currentChannels.filter(ch => ch !== channel)
            : [...currentChannels, channel];

        updateInteractionType(type, 'channels', newChannels);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!preferences) {
        return (
            <div className="p-6 bg-red-50 rounded-lg">
                <p className="text-red-600">Failed to load notification preferences. Please try again.</p>
            </div>
        );
    }

    return (
        <div className={standalone ? "min-h-screen bg-gray-50 p-6" : ""}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Notification Preferences</h1>
                            <p className="text-gray-600 mt-1">Configure how you receive lead notifications</p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('channels')}
                            className={`pb-2 px-4 ${
                                activeTab === 'channels'
                                    ? 'border-b-2 border-green-600 text-green-600 font-semibold'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Channels
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`pb-2 px-4 ${
                                activeTab === 'events'
                                    ? 'border-b-2 border-green-600 text-green-600 font-semibold'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Event Routing
                        </button>
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : message.type === 'error'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Channels Tab */}
                {activeTab === 'channels' && (
                    <div className="space-y-4">
                        {/* SMS */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">📱 SMS Notifications</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.channels.sms.enabled}
                                        onChange={(e) => updateChannelEnabled('sms', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition ${
                                        preferences.channels.sms.enabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition transform ${
                                            preferences.channels.sms.enabled ? 'translate-x-6' : ''
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                            {preferences.channels.sms.enabled && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number (optional, uses profile phone if not set)
                                        </label>
                                        <input
                                            type="tel"
                                            value={preferences.channels.sms.phoneNumber || ''}
                                            onChange={(e) => updateChannelContact('sms', 'phoneNumber', e.target.value)}
                                            placeholder="+254712345678"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            <strong>Rate Limit:</strong> {preferences.rateLimits.sms.maxPerHour}/hour, {preferences.rateLimits.sms.maxPerDay}/day
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* WhatsApp */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">💬 WhatsApp Notifications</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.channels.whatsapp.enabled}
                                        onChange={(e) => updateChannelEnabled('whatsapp', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition ${
                                        preferences.channels.whatsapp.enabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition transform ${
                                            preferences.channels.whatsapp.enabled ? 'translate-x-6' : ''
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                            {preferences.channels.whatsapp.enabled && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            WhatsApp Number (optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={preferences.channels.whatsapp.phoneNumber || ''}
                                            onChange={(e) => updateChannelContact('whatsapp', 'phoneNumber', e.target.value)}
                                            placeholder="+254712345678"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            <strong>Rate Limit:</strong> {preferences.rateLimits.whatsapp.maxPerHour}/hour, {preferences.rateLimits.whatsapp.maxPerDay}/day
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">📧 Email Notifications</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.channels.email.enabled}
                                        onChange={(e) => updateChannelEnabled('email', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition ${
                                        preferences.channels.email.enabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition transform ${
                                            preferences.channels.email.enabled ? 'translate-x-6' : ''
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                            {preferences.channels.email.enabled && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address (optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={preferences.channels.email.emailAddress || ''}
                                        onChange={(e) => updateChannelContact('email', 'emailAddress', e.target.value)}
                                        placeholder="agent@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>

                        {/* In-App */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">🔔 In-App Notifications</h3>
                                    <p className="text-sm text-gray-600 mt-1">Always enabled for important updates</p>
                                </div>
                                <div className="w-12 h-6 bg-green-600 rounded-full flex items-center">
                                    <div className="w-5 h-5 bg-white rounded-full m-0.5 transform translate-x-6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Routing Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-4">
                        {/* Lead Captured */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">🎉 Lead Captured</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.interactionTypes.leadCaptured.enabled}
                                        onChange={(e) => updateInteractionType('leadCaptured', 'enabled', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition ${
                                        preferences.interactionTypes.leadCaptured.enabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition transform ${
                                            preferences.interactionTypes.leadCaptured.enabled ? 'translate-x-6' : ''
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                            {preferences.interactionTypes.leadCaptured.enabled && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notify via:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['sms', 'whatsapp', 'email', 'inApp'].map(channel => (
                                                <button
                                                    key={channel}
                                                    onClick={() => toggleInteractionChannel('leadCaptured', channel)}
                                                    className={`px-4 py-2 rounded-lg border transition ${
                                                        preferences.interactionTypes.leadCaptured.channels.includes(channel)
                                                            ? 'bg-green-600 text-white border-green-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                                                    }`}
                                                >
                                                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={preferences.interactionTypes.leadCaptured.priority}
                                            onChange={(e) => updateInteractionType('leadCaptured', 'priority', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email Inquiry */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">📧 Email Inquiry</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.interactionTypes.emailInquiry.enabled}
                                        onChange={(e) => updateInteractionType('emailInquiry', 'enabled', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition ${
                                        preferences.interactionTypes.emailInquiry.enabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition transform ${
                                            preferences.interactionTypes.emailInquiry.enabled ? 'translate-x-6' : ''
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                            {preferences.interactionTypes.emailInquiry.enabled && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notify via:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['sms', 'whatsapp', 'email', 'inApp'].map(channel => (
                                                <button
                                                    key={channel}
                                                    onClick={() => toggleInteractionChannel('emailInquiry', channel)}
                                                    className={`px-4 py-2 rounded-lg border transition ${
                                                        preferences.interactionTypes.emailInquiry.channels.includes(channel)
                                                            ? 'bg-green-600 text-white border-green-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                                                    }`}
                                                >
                                                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={preferences.interactionTypes.emailInquiry.priority}
                                            onChange={(e) => updateInteractionType('emailInquiry', 'priority', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* High Score Lead */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">🔥 High Score Lead</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.interactionTypes.highScoreLead.enabled}
                                        onChange={(e) => updateInteractionType('highScoreLead', 'enabled', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition ${
                                        preferences.interactionTypes.highScoreLead.enabled ? 'bg-green-600' : 'bg-gray-300'
                                    }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition transform ${
                                            preferences.interactionTypes.highScoreLead.enabled ? 'translate-x-6' : ''
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                            {preferences.interactionTypes.highScoreLead.enabled && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Score Threshold
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={preferences.interactionTypes.highScoreLead.scoreThreshold || 75}
                                            onChange={(e) => updateInteractionType('highScoreLead', 'scoreThreshold', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Trigger urgent notifications for leads scoring above this threshold
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notify via:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['sms', 'whatsapp', 'email', 'inApp'].map(channel => (
                                                <button
                                                    key={channel}
                                                    onClick={() => toggleInteractionChannel('highScoreLead', channel)}
                                                    className={`px-4 py-2 rounded-lg border transition ${
                                                        preferences.interactionTypes.highScoreLead.channels.includes(channel)
                                                            ? 'bg-green-600 text-white border-green-600'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                                                    }`}
                                                >
                                                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={preferences.interactionTypes.highScoreLead.priority}
                                            onChange={(e) => updateInteractionType('highScoreLead', 'priority', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
                    <button
                        onClick={handleTest}
                        disabled={testing}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {testing ? 'Sending Test...' : 'Test Notifications'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
