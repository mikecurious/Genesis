
import React, { useState } from 'react';
import { type Listing, type Message, type Tenant, type MaintenanceRequest, type NewListingInput } from '../../../types';
import { ListingForm } from '../ListingForm';
import { CombinedListingManager } from './CombinedListingManager';
import { CombinedClientChat } from './CombinedClientChat';
import { CombinedMarketing } from './CombinedMarketing';
import { CombinedInsights } from './CombinedInsights';
import { CombinedAiSettings } from './CombinedAiSettings';
import { TenantAiManagement } from '../TenantAiManagement';
import { CombinedMaintenance } from './CombinedMaintenance';
import { AutomationDashboard } from '../../AutomationDashboard';
import { type User } from '../../../types';


interface CombinedDashboardProps {
    listings: Listing[];
    onAddListing: (newListing: NewListingInput) => void;
    interactionChats: Record<string, Message[]>;
    humanTakeoverChats: Record<string, boolean>;
    onTakeoverChat: (propertyId: string) => void;
    onSendAgentMessage: (propertyId: string, text: string) => void;
    tenants: Tenant[];
    isTenantManagementActive: boolean;
    onActivateTenantManagement: () => void;
    onAddTenant: () => void;

    maintenanceRequests: MaintenanceRequest[];
    user: User;
}

type CombinedDashboardTab = 'listings' | 'chat' | 'marketing' | 'insights' | 'settings' | 'tenantAi' | 'maintenance' | 'automation';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${active
            ? 'border-green-500 text-gray-900 dark:text-white'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
            }`}
    >
        {children}
    </button>
);

export const CombinedDashboard: React.FC<CombinedDashboardProps> = ({
    listings, onAddListing, interactionChats, humanTakeoverChats, onTakeoverChat, onSendAgentMessage,
    tenants, isTenantManagementActive, onActivateTenantManagement, onAddTenant, maintenanceRequests, user
}) => {
    const [activeTab, setActiveTab] = useState<CombinedDashboardTab>('listings');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAddListingSubmit = (newListing: NewListingInput) => {
        onAddListing(newListing);
        setIsFormOpen(false);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'listings':
                return <CombinedListingManager listings={listings} onOpenAddListingModal={() => setIsFormOpen(true)} />;
            case 'chat':
                return (
                    <CombinedClientChat
                        interactionChats={interactionChats}
                        listings={listings}
                        humanTakeoverChats={humanTakeoverChats}
                        onTakeoverChat={onTakeoverChat}
                        onSendAgentMessage={onSendAgentMessage}
                    />
                );

            case 'automation':
                return <AutomationDashboard user={user} automationEnabled={false} voiceFeatureEnabled={false} />;
            case 'tenantAi':
                return (
                    <TenantAiManagement
                        isActive={isTenantManagementActive}
                        onActivate={onActivateTenantManagement}
                        tenants={tenants}
                        onAddTenant={onAddTenant}
                    />
                );
            case 'maintenance':
                return <CombinedMaintenance requests={maintenanceRequests} />;
            case 'marketing':
                return <CombinedMarketing listings={listings} />;
            case 'insights':
                return <CombinedInsights listings={listings} />;
            case 'settings':
                return <CombinedAiSettings />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-black flex flex-col pt-16 h-full">
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col flex-1">
                <header className="mb-8 flex-shrink-0">
                    <h1 className="text-3xl font-bold tracking-tight">Combined Dashboard</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Manage all your Agent and Property Owner activities in one place.</p>
                </header>

                <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex-shrink-0">
                    <nav className="flex space-x-1 md:space-x-2 flex-wrap">
                        <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')}>My Listings</TabButton>
                        <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>Client Chat</TabButton>
                        <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')}>Automation</TabButton>
                        <TabButton active={activeTab === 'tenantAi'} onClick={() => setActiveTab('tenantAi')}>Tenant AI</TabButton>
                        <TabButton active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')}>Maintenance</TabButton>
                        <TabButton active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')}>Marketing</TabButton>
                        <TabButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')}>AI Insights</TabButton>
                        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>AI Settings</TabButton>
                    </nav>
                </div>

                <main className="flex-1 overflow-y-auto pb-8">
                    {renderContent()}
                </main>
            </div>

            <ListingForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onAddListing={handleAddListingSubmit}
            />
        </div>
    );
};
