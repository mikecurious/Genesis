import React, { useState } from 'react';
import { type Tenant, type MaintenanceRequest, Role, type Message, type Technician, type FinancialStatement, type AutomationRule } from '../../../types';
import { generateTenantManagementResponse } from '../../../services/geminiService';
import { ChatHistoryModal } from '../../modals/ChatHistoryModal';
import { TenantList } from '../ai-manager/TenantList';
import { TenantOnboarding } from '../ai-manager/TenantOnboarding';
import { MaintenanceCenter } from '../ai-manager/MaintenanceCenter';
import { FinanceCenter } from '../ai-manager/FinanceCenter';
import { AutomationSettings } from '../ai-manager/AutomationSettings';
import { TechnicianList } from '../ai-manager/TechnicianList';

interface AIPropertyManagerProps {
    isActive: boolean;
    onActivate: () => void;
    tenants: Tenant[];
    maintenanceRequests: MaintenanceRequest[];
    onAddTenant: (tenant: Omit<Tenant, 'id' | 'rentStatus'>) => void;
}

// Mock Data
const mockTechnicians: Technician[] = [
    { id: '1', name: 'Mike Plumber', specialty: 'Plumbing', phone: '555-0101', rating: 4.8, availability: 'Available' },
    { id: '2', name: 'Sarah Electric', specialty: 'Electrical', phone: '555-0102', rating: 4.9, availability: 'Busy' },
];

const mockStatements: FinancialStatement[] = [
    { id: '1', month: 'October 2023', totalRentCollected: 45000, totalExpenses: 3200, netIncome: 41800, generatedDate: '2023-11-01', status: 'Sent' },
    { id: '2', month: 'September 2023', totalRentCollected: 44500, totalExpenses: 1500, netIncome: 43000, generatedDate: '2023-10-01', status: 'Sent' },
];

const mockRules: AutomationRule[] = [
    { id: '1', type: 'RentReminder', enabled: true, daysBefore: 3, messageTemplate: "Hi {name}, friendly reminder that rent for {unit} is due on {date}. Thanks!" },
    { id: '2', type: 'MaintenanceUpdate', enabled: true, messageTemplate: "Update on your request: {status}. Technician {tech_name} has been assigned." },
    { id: '3', type: 'LeaseRenewal', enabled: false, messageTemplate: "Hi {name}, your lease expires in 60 days. Would you like to discuss renewal?" },
];

const LockedView: React.FC<{ onActivate: () => void }> = ({ onActivate }) => (
    <div className="bg-white dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center flex flex-col items-center justify-center animate-fade-in-up h-full min-h-[400px]">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-6">
            <svg className="w-16 h-16 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">AI Manager</h2>
        <p className="mt-2 max-w-lg text-gray-600 dark:text-gray-400 text-lg">
            Your all-in-one automated solution for tenant management and maintenance.
            Let AI handle rent reminders, maintenance requests, and tenant communications.
        </p>
        <button
            onClick={onActivate}
            className="mt-8 bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1"
        >
            Activate AI Manager
        </button>
    </div>
);

const UnlockedView: React.FC<AIPropertyManagerProps> = ({ tenants, maintenanceRequests, onAddTenant }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'maintenance' | 'finance' | 'automation'>('overview');
    const [isAddingTenant, setIsAddingTenant] = useState(false);
    const [command, setCommand] = useState('');
    const [aiResponses, setAiResponses] = useState<{ role: Role, text: string }[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [activeHistory, setActiveHistory] = useState<{ tenant: Tenant; messages: Message[] } | null>(null);

    // Mock handlers
    const handleAssignTechnician = (requestId: string) => {
        console.log('Assign technician to request:', requestId);
    };

    const handleGenerateStatement = () => {
        console.log('Generate statement');
    };

    const handleToggleRule = (ruleId: string) => {
        console.log('Toggle rule:', ruleId);
    };

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

    if (isAddingTenant) {
        return (
            <TenantOnboarding
                onAddTenant={(newTenant) => {
                    onAddTenant(newTenant);
                    setIsAddingTenant(false);
                }}
                onCancel={() => setIsAddingTenant(false)}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header Section with AI Chat */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🤖</span> AI Assistant
                    </h2>
                    <span className="self-start md:self-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">Active</span>
                </div>

                <div className="h-64 md:h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-4 text-sm space-y-3 border border-gray-100 dark:border-gray-700">
                    {aiResponses.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            <p>How can I help you manage your property today?</p>
                            <p className="text-xs mt-2">Try: "Send rent reminders" or "Check maintenance status"</p>
                        </div>
                    )}
                    {aiResponses.map((res, i) => (
                        <div key={i} className={`flex ${res.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[80%] p-3 rounded-2xl ${res.role === Role.USER
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-none shadow-sm'
                                }`}>
                                {res.text}
                            </div>
                        </div>
                    ))}
                    {isAiLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendCommand} className="relative">
                    <input
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Ask AI..."
                        className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm md:text-base"
                    />
                    <button
                        type="submit"
                        disabled={isAiLoading || !command.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                {/* Mobile Navigation (Select) */}
                <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <label htmlFor="tabs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Navigate to</label>
                    <div className="relative">
                        <select
                            id="tabs"
                            name="tabs"
                            className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl dark:bg-gray-800 dark:text-white shadow-sm appearance-none transition-colors"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value as any)}
                        >
                            <option value="overview">Overview</option>
                            <option value="tenants">Tenants ({tenants.length})</option>
                            <option value="maintenance">Maintenance ({maintenanceRequests.length})</option>
                            <option value="finance">Finance</option>
                            <option value="automation">Automation</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation (Tabs) */}
                <div className="hidden md:block border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <nav className="flex -mb-px min-w-max">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('tenants')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'tenants' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Tenants ({tenants.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'maintenance' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Maintenance ({maintenanceRequests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'finance' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Finance
                        </button>
                        <button
                            onClick={() => setActiveTab('automation')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'automation' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Automation
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Occupancy Rate</h3>
                                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">92%</p>
                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">11/12 Units Rented</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Rent Collected</h3>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">$45.2k</p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">98% of expected</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
                                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Maintenance</h3>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">3 Active</p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">1 High Priority</p>
                                </div>
                            </div>
                            <TechnicianList technicians={mockTechnicians} />
                        </div>
                    )}

                    {activeTab === 'tenants' && (
                        <TenantList
                            tenants={tenants}
                            onAddTenant={() => setIsAddingTenant(true)}
                            onViewDetails={(tenant) => console.log('View tenant:', tenant)}
                        />
                    )}

                    {activeTab === 'maintenance' && (
                        <MaintenanceCenter
                            requests={maintenanceRequests}
                            onAssignTechnician={handleAssignTechnician}
                        />
                    )}

                    {activeTab === 'finance' && (
                        <FinanceCenter
                            statements={mockStatements}
                            onGenerateStatement={handleGenerateStatement}
                        />
                    )}

                    {activeTab === 'automation' && (
                        <AutomationSettings
                            rules={mockRules}
                            onToggleRule={handleToggleRule}
                        />
                    )}
                </div>
            </div>

            <ChatHistoryModal
                isOpen={!!activeHistory}
                onClose={() => setActiveHistory(null)}
                tenant={activeHistory?.tenant || null}
                messages={activeHistory?.messages || []}
            />
        </div>
    );
};

export const AIPropertyManager: React.FC<AIPropertyManagerProps> = (props) => {
    return props.isActive ? <UnlockedView {...props} /> : <LockedView onActivate={props.onActivate} />;
};
