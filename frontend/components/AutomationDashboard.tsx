import React, { useState } from 'react';
import type { User } from '../types';

interface AutomationDashboardProps {
    user: User;
    automationEnabled?: boolean;      // From AI Settings "AI Client Follow-up"
    voiceFeatureEnabled?: boolean;    // From AI Settings "AI Voice" premium
    onNavigateToSettings?: () => void; // Callback to navigate to AI Settings
}

interface AutomationSettings {
    // Agent
    autoRespond?: boolean;
    autoSchedule?: boolean;
    autoMarketing?: boolean;
    autoFollowUp?: boolean;
    voiceAssistant?: boolean;

    // Landlord
    rentReminders?: boolean;
    tenantScreening?: boolean;
    maintenanceScheduling?: boolean;

    // Property Seller/Owner
    pricingOptimization?: boolean;
    marketAnalysis?: boolean;
    listingOptimization?: boolean;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }> = ({ enabled, onChange, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`${enabled && !disabled ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
        <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </button>
);

const PremiumBadge: React.FC = () => (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        ⭐ Premium
    </span>
);

const AutomationCard: React.FC<{
    title: string;
    description: string;
    enabled: boolean;
    disabled: boolean;
    isPremium?: boolean;
    premiumMessage?: string;
    onChange: (enabled: boolean) => void;
}> = ({ title, description, enabled, disabled, isPremium, premiumMessage, onChange }) => {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                        {isPremium && <PremiumBadge />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                    {disabled && isPremium && premiumMessage && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{premiumMessage}</span>
                        </div>
                    )}
                </div>
                <ToggleSwitch
                    enabled={enabled}
                    onChange={onChange}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ user, automationEnabled = false, voiceFeatureEnabled = false, onNavigateToSettings }) => {
    const [settings, setSettings] = useState<AutomationSettings>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (key: keyof AutomationSettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Backend integration - save automation settings
            console.log('Saving automation settings:', settings);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            alert('Automation settings saved successfully!');
        } catch (error) {
            console.error('Error saving automation settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const getAutomationsForRole = () => {
        switch (user.role) {
            case 'Agent':
                return [
                    { key: 'autoRespond' as keyof AutomationSettings, title: 'Auto-Respond to Inquiries', description: 'Automatically respond to client messages with AI-powered replies', isPremium: false },
                    { key: 'autoSchedule' as keyof AutomationSettings, title: 'Auto-Schedule Viewings', description: 'Automatically schedule property viewings based on client availability', isPremium: false },
                    { key: 'autoMarketing' as keyof AutomationSettings, title: 'Auto-Generate Marketing', description: 'Create marketing content for your properties automatically', isPremium: false },
                    { key: 'autoFollowUp' as keyof AutomationSettings, title: 'Auto-Follow-Up Leads', description: 'Send automated follow-up messages to potential clients', isPremium: false },
                    { key: 'voiceAssistant' as keyof AutomationSettings, title: 'AI Voice Assistant', description: 'Handle client calls with AI voice technology 24/7', isPremium: true },
                ];
            case 'Landlord':
                return [
                    { key: 'rentReminders' as keyof AutomationSettings, title: 'Send Rent Reminders', description: 'Automatically send rent payment reminders to tenants', isPremium: false },
                    { key: 'tenantScreening' as keyof AutomationSettings, title: 'Screen Tenant Applications', description: 'AI-powered tenant application screening and analysis', isPremium: false },
                    { key: 'maintenanceScheduling' as keyof AutomationSettings, title: 'Schedule Maintenance', description: 'Automatically schedule and assign maintenance tasks', isPremium: false },
                    { key: 'voiceAssistant' as keyof AutomationSettings, title: 'AI Voice Assistant', description: 'Handle tenant calls with AI voice technology 24/7', isPremium: true },
                ];
            case 'Property Seller':
            case 'Property Owner':
                return [
                    { key: 'pricingOptimization' as keyof AutomationSettings, title: 'Optimize Pricing', description: 'AI-powered pricing recommendations based on market analysis', isPremium: false },
                    { key: 'marketAnalysis' as keyof AutomationSettings, title: 'Market Analysis', description: 'Automated market trends and competitor analysis reports', isPremium: false },
                    { key: 'listingOptimization' as keyof AutomationSettings, title: 'Optimize Listings', description: 'Automatically improve listing descriptions and photos', isPremium: false },
                ];
            default:
                return [];
        }
    };

    const automations = getAutomationsForRole();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🤖 Automation Center</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your AI-powered automation features</p>
            </div>

            {/* Permission Warning Banner */}
            {!automationEnabled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Automation Not Enabled</h3>
                            <p className="text-yellow-800 dark:text-yellow-300 mb-3">
                                Please enable automation in AI Settings first to use these features. Enable "AI Client Follow-up" and "AI Booking Reminders" to unlock automation capabilities.
                            </p>
                            <button
                                onClick={() => {
                                    if (onNavigateToSettings) {
                                        onNavigateToSettings();
                                    } else {
                                        console.log('Navigate to AI Settings - no handler provided');
                                    }
                                }}
                                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Go to AI Settings
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Automation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {automations.map((automation) => (
                    <AutomationCard
                        key={automation.key}
                        title={automation.title}
                        description={automation.description}
                        enabled={settings[automation.key] || false}
                        disabled={!automationEnabled || (automation.isPremium && !voiceFeatureEnabled)}
                        isPremium={automation.isPremium}
                        premiumMessage={automation.isPremium && !voiceFeatureEnabled ? "Go to AI Settings to activate and pay for this premium feature" : undefined}
                        onChange={(val) => handleToggle(automation.key, val)}
                    />
                ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!automationEnabled || isSaving}
                    className={`${!automationEnabled || isSaving
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2`}
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        'Save Automation Settings'
                    )}
                </button>
            </div>
        </div>
    );
};
