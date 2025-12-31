
import React, { useState } from 'react';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
    </div>
);

export const CombinedAiSettings: React.FC = () => {
    const [followUp, setFollowUp] = useState(true);
    const [reminders, setReminders] = useState(true);
    const [whatsAppNumber, setWhatsAppNumber] = useState('');

    const handleActivateVoice = () => {
        alert("Redirecting to payment gateway to activate AI Voice for Client. This is a premium feature.");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Left Column */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Automation Settings</h2>
                    <div className="space-y-4">
                        <ToggleSwitch label="AI Client Follow-up" enabled={followUp} onChange={setFollowUp} />
                        <ToggleSwitch label="AI Booking Reminders" enabled={reminders} onChange={setReminders} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                     <div>
                        <label htmlFor="whatsapp" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Number for Alerts</label>
                        <div className="flex gap-2">
                           <input
                                type="tel"
                                id="whatsapp"
                                value={whatsAppNumber}
                                onChange={(e) => setWhatsAppNumber(e.target.value)}
                                placeholder="+254 712 345 678"
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
                            />
                            <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm">
                                Save
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">The AI will send booking and connection alerts to this number.</p>
                    </div>
                </div>
            </div>
            
            {/* Right Column */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Premium Feature</h2>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">AI Voice for Client</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Enable a fully voice-based interaction for your clients. Our AI can handle calls, answer questions, and schedule viewings on your behalf, 24/7.
                    </p>
                </div>
                 <button
                    onClick={handleActivateVoice}
                    className="mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                    Activate Feature
                </button>
            </div>
        </div>
    );
};
