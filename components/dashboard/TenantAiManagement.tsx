import React, { useState } from 'react';
import { type Tenant, Role, type Message } from '../../types';
import { generateTenantManagementResponse } from '../../services/geminiService';
import { ChatHistoryModal } from '../modals/ChatHistoryModal';

interface TenantAiManagementProps {
    isActive: boolean;
    onActivate: () => void;
    tenants: Tenant[];
    onAddTenant: () => void;
}

const statusColorMap = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const LockedView: React.FC<{ onActivate: () => void }> = ({ onActivate }) => (
    <div className="bg-white dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center flex flex-col items-center justify-center animate-fade-in-up h-full">
        <svg className="w-16 h-16 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unlock Tenant AI Management</h2>
        <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
            Automate rent reminders, manage maintenance requests, and send announcements to all your tenants with our powerful AI assistant.
        </p>
        <button
            onClick={onActivate}
            className="mt-6 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
            Activate Tenant AI Management
        </button>
    </div>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
    </div>
);

const UnlockedView: React.FC<{ tenants: Tenant[], onAddTenant: () => void }> = ({ tenants, onAddTenant }) => {
    const MOCK_HISTORIES_LIST: Message[][] = [
      [
          { id: '1', role: Role.USER, text: 'Hi, I noticed my rent is marked as due. Can I confirm the payment details?' },
          { id: '2', role: Role.MODEL, text: 'Of course! You can make payments via M-Pesa to PayBill 123456, Account number 1A. The amount due is 55,000 KSh.' },
          { id: '3', role: Role.USER, text: 'Great, thank you! I will process that shortly.' },
      ],
      [
          { id: '4', role: Role.USER, text: 'Hello, the faucet in my kitchen is leaking.' },
          { id: '5', role: Role.MODEL, text: 'I\'m sorry to hear that. I have logged a maintenance request for you. A plumber will contact you within 24 hours to schedule a visit.' },
          { id: '6', role: Role.USER, text: 'Perfect, thanks for the quick response.' },
          { id: '7', role: Role.MODEL, text: 'You\'re welcome! Is there anything else I can assist you with today?' },
      ],
    ];

    const [command, setCommand] = useState('');
    const [whatsAppNumber, setWhatsAppNumber] = useState('');
    const [aiResponses, setAiResponses] = useState<{ role: Role, text: string }[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [whatsAppEnabled, setWhatsAppEnabled] = useState(true);
    const [activeHistory, setActiveHistory] = useState<{ tenant: Tenant; messages: Message[] } | null>(null);

    const handleSendCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        const userMessage = { role: Role.USER, text: command };
        setAiResponses(prev => [...prev, userMessage]);
        setCommand('');
        setIsAiLoading(true);

        try {
            const responseText = await generateTenantManagementResponse(command, tenants);
            const aiMessage = { role: Role.MODEL, text: responseText };
            setAiResponses(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { role: Role.MODEL, text: "Sorry, I couldn't process that. Please try again." };
            setAiResponses(prev => [...prev, errorMessage]);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleViewHistory = (tenant: Tenant, index: number) => {
      const messages = MOCK_HISTORIES_LIST[index % MOCK_HISTORIES_LIST.length] || [];
      setActiveHistory({ tenant, messages });
    };

    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Tenant List ({tenants.length})</h2>
                    <button
                        onClick={onAddTenant}
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                        + Add Tenant
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-4 py-3">Name</th>
                                <th scope="col" className="px-4 py-3">Unit</th>
                                <th scope="col" className="px-4 py-3">Contact</th>
                                <th scope="col" className="px-4 py-3">Rent Status</th>
                                <th scope="col" className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {tenants.map((tenant, index) => (
                                <tr key={tenant.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <th scope="row" className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{tenant.name}</th>
                                    <td className="px-4 py-3">{tenant.unit}</td>
                                    <td className="px-4 py-3">{tenant.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColorMap[tenant.rentStatus]}`}>{tenant.rentStatus}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleViewHistory(tenant, index)}
                                            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline"
                                        >
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">AI Chat</h2>
                    <div className="h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-md mb-4 text-xs space-y-2">
                        {aiResponses.length === 0 && <p className="text-gray-400 text-center p-4">Chat with the AI to manage tenants.</p>}
                        {aiResponses.map((res, i) => (
                            <div key={i} className={`p-2 rounded-lg ${res.role === Role.USER ? 'bg-blue-100 dark:bg-blue-900/50 text-right' : 'bg-gray-200 dark:bg-gray-700 text-left'}`}>
                                {res.text}
                            </div>
                        ))}
                         {isAiLoading && <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">...</div>}
                    </div>
                     <form onSubmit={handleSendCommand}>
                        <textarea
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="e.g., Send rent reminders to overdue tenants"
                            rows={2}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        />
                        <button type="submit" disabled={isAiLoading} className="mt-2 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                           {isAiLoading ? 'Processing...' : 'Send Command'}
                        </button>
                    </form>
                </div>
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                     <h2 className="text-xl font-semibold mb-4">WhatsApp Notifications</h2>
                     <div className="space-y-4">
                        <ToggleSwitch label="Enable WhatsApp Alerts" enabled={whatsAppEnabled} onChange={setWhatsAppEnabled} />
                        <div className={`transition-all duration-300 ${whatsAppEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label htmlFor="whatsapp-number" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Number</label>
                            <div className="flex gap-2">
                                <input
                                    id="whatsapp-number"
                                    type="tel"
                                    value={whatsAppNumber}
                                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                                    placeholder="+254 712 345 678"
                                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                />
                                <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm">Save</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Get instant updates on tenant communications.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ChatHistoryModal
            isOpen={!!activeHistory}
            onClose={() => setActiveHistory(null)}
            tenant={activeHistory?.tenant || null}
            messages={activeHistory?.messages || []}
        />
      </>
    );
};

export const TenantAiManagement: React.FC<TenantAiManagementProps> = ({ isActive, onActivate, tenants, onAddTenant }) => {
    return isActive ? <UnlockedView tenants={tenants} onAddTenant={onAddTenant} /> : <LockedView onActivate={onActivate} />;
};