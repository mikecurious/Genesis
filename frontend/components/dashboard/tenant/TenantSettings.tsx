
import React, { useState } from 'react';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
    </div>
);

export const TenantSettings: React.FC = () => {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [whatsAppAlerts, setWhatsAppAlerts] = useState(false);
    const [whatsAppNumber, setWhatsAppNumber] = useState('');

    return (
         <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        defaultValue="tenant@demo.com"
                        disabled
                        className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" 
                    />
                </div>
                <div>
                    <label htmlFor="whatsapp" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your WhatsApp Number</label>
                     <input
                        type="tel"
                        id="whatsapp"
                        value={whatsAppNumber}
                        onChange={(e) => setWhatsAppNumber(e.target.value)}
                        placeholder="+254 712 345 678"
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    />
                </div>
                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <ToggleSwitch label="Email Notifications" enabled={emailAlerts} onChange={setEmailAlerts} />
                    <ToggleSwitch label="WhatsApp Notifications" enabled={whatsAppAlerts} onChange={setWhatsAppAlerts} />
                </div>
                <div className="pt-2">
                    <button className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Save Preferences</button>
                </div>
            </div>
        </div>
    );
};
