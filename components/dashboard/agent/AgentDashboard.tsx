import React, { useState } from 'react';
import { type Listing, type Message, type User, type Tenant, type MaintenanceRequest } from '../../../types';
import { AgentListingManager } from './AgentListingManager';
import { AgentClientChat } from './AgentClientChat';
import { AgentMarketing } from './AgentMarketing';
import { AgentAiSettings } from './AgentAiSettings';
import { ListingForm } from '../ListingForm';
import { FeaturePaymentModal } from '../../modals/FeaturePaymentModal';
import { DashboardSidebar, type DashboardSection } from '../DashboardSidebar';
import { AutomationDashboard } from '../../AutomationDashboard';
import { LeadViewer } from '../LeadViewer';
import { ProfileSettings } from '../ProfileSettings';
import { NotificationBadge } from '../NotificationBadge';
import { NotificationPanel } from '../NotificationPanel';
import { AIPropertyManager } from '../combined/AIPropertyManager';

interface AgentDashboardProps {
    user?: User; // NEW: User information
    listings: Listing[];
    onAddListing: (newListing: Omit<Listing, 'id' | 'agentName' | 'agentContact' | 'createdBy' | 'imageUrls'> & { images: File[] }) => void;
    onEditListing?: (propertyId: string, updatedData: Partial<Omit<Listing, 'id' | 'imageUrls'>>) => Promise<void>;
    onDeleteListing?: (propertyId: string) => Promise<void>;
    interactionChats: Record<string, Message[]>;
    humanTakeoverChats: Record<string, boolean>;
    onTakeoverChat: (propertyId: string) => void;
    onSendAgentMessage: (propertyId: string, text: string) => void;
}

type AgentDashboardTab = 'listings' | 'chat' | 'marketing' | 'settings' | 'announcements';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${active
            ? 'border-indigo-500 text-gray-900 dark:text-white'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
            }`}
    >
        {children}
    </button>
);

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
    user,
    listings,
    onAddListing,
    onEditListing,
    onDeleteListing,
    interactionChats,
    humanTakeoverChats,
    onTakeoverChat,
    onSendAgentMessage
}) => {
    const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
    const [listingToBoost, setListingToBoost] = useState<Listing | null>(null);

    // AI Manager State
    const [isTenantManagementActive, setIsTenantManagementActive] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);

    const handleAddListingSubmit = (newListing: Omit<Listing, 'id' | 'agentName' | 'agentContact' | 'createdBy' | 'imageUrls'> & { images: File[] }) => {
        onAddListing(newListing);
        setIsFormOpen(false);
    };

    const handleBoostClick = (listing: Listing) => {
        setListingToBoost(listing);
        setIsBoostModalOpen(true);
    };

    const handleConfirmBoostPayment = () => {
        if (listingToBoost) {
            console.log(`Boosting property: ${listingToBoost.title} for 6,000 KSh`);
            // In a real app, this would trigger an API call to the backend
            // to mark the property as boosted and process the payment.
            alert(`Payment successful! Your property "${listingToBoost.title}" is now boosted.`);
        }
        setIsBoostModalOpen(false);
        setListingToBoost(null);
    };

    const handleAddTenant = (newTenant: Omit<Tenant, 'id' | 'rentStatus'>) => {
        const tenant: Tenant = {
            ...newTenant,
            id: Math.random().toString(36).substr(2, 9),
            rentStatus: 'Paid' // Default status
        };
        setTenants([...tenants, tenant]);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <AgentListingManager listings={listings} onOpenAddListingModal={() => setIsFormOpen(true)} onEditListing={onEditListing} onDeleteListing={onDeleteListing} />;
            case 'leads':
                return <LeadViewer />;
            case 'analytics':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analytics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{listings.length}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Chats</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{Object.keys(interactionChats).length}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">24%</p>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return <NotificationPanel />;
            case 'chat':
                return (
                    <AgentClientChat
                        interactionChats={interactionChats}
                        listings={listings}
                        humanTakeoverChats={humanTakeoverChats}
                        onTakeoverChat={onTakeoverChat}
                        onSendAgentMessage={onSendAgentMessage}
                    />
                );
            case 'marketing':
                return <AgentMarketing listings={listings} onBoostClick={handleBoostClick} />;
            case 'automation':
                return <AutomationDashboard user={user || { id: 'demo', name: 'Demo User', email: 'demo@example.com', role: 'Agent' } as User} automationEnabled={false} voiceFeatureEnabled={false} />;
            case 'ai-manager':
                return (
                    <AIPropertyManager
                        isActive={isTenantManagementActive}
                        onActivate={() => setIsTenantManagementActive(true)}
                        tenants={tenants}
                        maintenanceRequests={maintenanceRequests}
                        onAddTenant={handleAddTenant}
                    />
                );
            case 'ai-settings':
                return <AgentAiSettings />;
            case 'settings':
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
                return <AgentListingManager listings={listings} onOpenAddListingModal={() => setIsFormOpen(true)} onEditListing={onEditListing} onDeleteListing={onDeleteListing} />;
        }
    };

    return (
        <div className="flex-1 bg-gray-50 dark:bg-black flex pt-16 h-full overflow-hidden">
            {/* Dashboard Sidebar */}
            <DashboardSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col flex-1 overflow-hidden">
                    {/* Welcome Section with Role & Name */}
                    <header className="mb-6 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                                    Welcome back!
                                    <span className="text-yellow-500 animate-wave inline-block origin-bottom-right">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {user?.role && <span className="font-semibold">{user.role}</span>}
                                    {user?.role && (user?.name || user?.email) && <span> • </span>}
                                    {user?.name || user?.email || 'Manage your properties and clients'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <NotificationBadge onViewAll={() => setActiveSection('notifications')} />
                            </div>
                        </div>
                    </header>
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto pb-8">
                        {renderContent()}
                    </main>
                </div>
            </div>

            <ListingForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onAddListing={handleAddListingSubmit}
                userRole={user?.role}
            />
            {isBoostModalOpen && listingToBoost && (
                <FeaturePaymentModal
                    isOpen={isBoostModalOpen}
                    onClose={() => setIsBoostModalOpen(false)}
                    onConfirm={handleConfirmBoostPayment}
                    title={`Boost Property: ${listingToBoost.title}`}
                    description="Promote your listing to get higher visibility, appear at the top of search results, and attract more potential clients."
                    price="6,000 KSh"
                />
            )}
        </div>
    );
};
