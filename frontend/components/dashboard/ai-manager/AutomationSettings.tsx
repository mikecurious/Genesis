import React from 'react';
import { AutomationRule } from '../../../types';

interface AutomationSettingsProps {
    rules: AutomationRule[];
    onToggleRule: (ruleId: string) => void;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({ rules, onToggleRule }) => {
    return (
        <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Global AI Automation Engine</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            The AI engine continuously monitors your properties, sends reminders, and handles maintenance triage 24/7.
                            Customize how the AI interacts with your tenants below.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {rules.map((rule) => (
                    <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 pr-0 md:pr-6 w-full">
                            <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {rule.type === 'RentReminder' && 'Rent Reminders'}
                                    {rule.type === 'MaintenanceUpdate' && 'Maintenance Updates'}
                                    {rule.type === 'LeaseRenewal' && 'Lease Renewal Notices'}
                                </h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {rule.enabled ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {rule.type === 'RentReminder' && `Automatically send WhatsApp reminders ${rule.daysBefore} days before due date.`}
                                {rule.type === 'MaintenanceUpdate' && 'Keep tenants informed about technician assignment and repair status.'}
                                {rule.type === 'LeaseRenewal' && 'Initiate renewal conversation 60 days before lease expiry.'}
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Message Template</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{rule.messageTemplate}"</p>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex justify-end">
                            <button
                                onClick={() => onToggleRule(rule.id)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${rule.enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
