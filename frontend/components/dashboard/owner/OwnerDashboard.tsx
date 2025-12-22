
import React, { useState } from 'react';
import { type Listing, type Message, type Tenant, type MaintenanceRequest, type User } from '../../../types';
import { OwnerListingManager } from './OwnerListingManager';
import { OwnerClientChat } from './OwnerClientChat';
import { OwnerMarketing } from './OwnerMarketing';
import { OwnerAiSettings } from './OwnerAiSettings';
import { ListingForm } from '../ListingForm';
import { TenantAiManagement } from '../TenantAiManagement';
import { OwnerMaintenance } from './OwnerMaintenance';
import { ProfileSettings } from '../ProfileSettings';
import { NotificationBadge } from '../NotificationBadge';
import { NotificationPanel } from '../NotificationPanel';

interface OwnerDashboardProps {
    user?: User; // NEW
    listings: Listing[];
    onAddListing: (newListing: Omit<Listing, 'id' | 'agentName' | 'agentContact' | 'createdBy' | 'imageUrls'> & { images: File[] }) => void;
    onEditListing?: (propertyId: string, updatedData: Partial<Omit<Listing, 'id' | 'imageUrls'>>) => Promise<void>;
    onDeleteListing?: (propertyId: string) => Promise<void>;
    interactionChats: Record<string, Message[]>;
    humanTakeoverChats: Record<string, boolean>;
    onTakeoverChat: (propertyId: string) => void;
    onSendAgentMessage: (propertyId: string, text: string) => void;
    tenants: Tenant[];
    isTenantManagementActive: boolean;
    onActivateTenantManagement: () => void;
    onAddTenant: () => void;
    maintenanceRequests: MaintenanceRequest[];
}

type OwnerDashboardTab = 'listings' | 'chat' | 'marketing' | 'settings' | 'tenantAi' | 'maintenance' | 'notifications' | 'profile';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${active
            ? 'border-indigo-500 text-gray-900 dark:text-white'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
            }`}
    >
        {children}
    </button>
);

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
    user, listings, onAddListing, onEditListing, onDeleteListing, interactionChats, humanTakeoverChats, onTakeoverChat, onSendAgentMessage,
    tenants, isTenantManagementActive, onActivateTenantManagement, onAddTenant, maintenanceRequests
}) => {
    const [activeTab, setActiveTab] = useState<OwnerDashboardTab>('listings');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAddListingSubmit = (newListing: Omit<Listing, 'id' | 'agentName' | 'agentContact' | 'createdBy' | 'imageUrls'> & { images: File[] }) => {
        onAddListing(newListing);
        setIsFormOpen(false);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'listings':
                return <OwnerListingManager listings={listings} onOpenAddListingModal={() => setIsFormOpen(true)} onEditListing={onEditListing} onDeleteListing={onDeleteListing} />;
            case 'chat':
                return (
                    <OwnerClientChat
                        interactionChats={interactionChats}
                        listings={listings}
                        humanTakeoverChats={humanTakeoverChats}
                        onTakeoverChat={onTakeoverChat}
                        onSendAgentMessage={onSendAgentMessage}
                    />
                );
            case 'marketing':
                return <OwnerMarketing listings={listings} />;
            case 'settings':
                return <OwnerAiSettings />;
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
                return <OwnerMaintenance requests={maintenanceRequests} />;
            case 'notifications':
                return <NotificationPanel />;
            case 'profile':
                return user ? (
                    <ProfileSettings user={user} onUpdate={(updatedUser) => {
                        console.log('User updated:', updatedUser);
                    }} />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-black flex flex-col pt-16 h-full">
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col flex-1">
                <header className="mb-8 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                Welcome back!
                                <span className="text-yellow-500 animate-wave inline-block origin-bottom-right">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                            </h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                {user?.role && <span className="font-semibold">{user.role}</span>}
                                {user?.role && (user?.name || user?.email) && <span> • </span>}
                                {user?.name || user?.email || 'Manage your properties and market them effectively'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBadge onViewAll={() => setActiveTab('notifications')} />
                        </div>
                    </div>
                </header>

                <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex-shrink-0">
                    <nav className="flex space-x-2 md:space-x-4 flex-wrap">
                        <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')}>My Listings</TabButton>
                        <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>Client Chat</TabButton>
                        <TabButton active={activeTab === 'tenantAi'} onClick={() => setActiveTab('tenantAi')}>Tenant AI</TabButton>
                        <TabButton active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')}>Maintenance</TabButton>
                        <TabButton active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')}>Marketing</TabButton>
                        <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>Notifications</TabButton>
                        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>AI Settings</TabButton>
                        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>Profile</TabButton>
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
                userRole={user?.role}
            />
        </div>
    );
};
