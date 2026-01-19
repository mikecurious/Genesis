import React, { useState } from 'react';
import { type Listing, type Message, type Tenant, type MaintenanceRequest, type User, type NewListingInput } from '../../../types';
import { OwnerListingManager } from '../owner/OwnerListingManager';
import { OwnerClientChat } from '../owner/OwnerClientChat';
import { OwnerMarketing } from '../owner/OwnerMarketing';
import { OwnerAiSettings } from '../owner/OwnerAiSettings';
import { ListingForm } from '../ListingForm';
import { AIPropertyManager } from '../combined/AIPropertyManager';
import { Settings } from '../ProfileSettings';
import { NotificationBadge } from '../NotificationBadge';
import { NotificationPanel } from '../NotificationPanel';
import { NotificationPreferences } from '../NotificationPreferences';
import { DashboardSidebar, type DashboardSection } from '../DashboardSidebar';
import { LeadViewer } from '../LeadViewer';
import { AutomationDashboard } from '../../AutomationDashboard';
import { tenantService } from '../../../services/apiService';

interface LandlordDashboardProps {
    user?: User;
    listings: Listing[];
    onAddListing: (newListing: NewListingInput) => void;
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

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
    user, listings, onAddListing, onEditListing, onDeleteListing, interactionChats, humanTakeoverChats, onTakeoverChat, onSendAgentMessage,
    tenants, isTenantManagementActive, onActivateTenantManagement, onAddTenant, maintenanceRequests
}) => {
    const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);

    const handleAddListingSubmit = (newListing: NewListingInput) => {
        onAddListing(newListing);
        setIsFormOpen(false);
    };

    const handleDownloadTenantReport = async () => {
        try {
            setIsDownloadingReport(true);
            const response = await tenantService.downloadTenantReport();
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const dateStamp = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `tenant-report-${dateStamp}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download tenant report:', error);
            alert('Failed to download tenant report. Please try again.');
        } finally {
            setIsDownloadingReport(false);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <OwnerListingManager listings={listings} onOpenAddListingModal={() => setIsFormOpen(true)} onEditListing={onEditListing} onDeleteListing={onDeleteListing} />;
            case 'leads':
                return <LeadViewer />;
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
            case 'ai-manager':
                return (
                    <AIPropertyManager
                        isActive={isTenantManagementActive}
                        onActivate={onActivateTenantManagement}
                        tenants={tenants}
                        maintenanceRequests={maintenanceRequests}
                        onAddTenant={onAddTenant}
                    />
                );
            case 'marketing':
                return <OwnerMarketing listings={listings} />;
            case 'ai-settings':
                return <OwnerAiSettings />;
            case 'analytics':
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analytics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{listings.length}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                    {listings.length > 0 ? Math.round((tenants.length / listings.length) * 100) : 0}%
                                </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Maintenance</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                                    {maintenanceRequests.filter(r => r.status !== 'Resolved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'automation':
                return <AutomationDashboard user={user || { id: 'demo', name: 'Demo User', email: 'demo@example.com', role: 'Landlord' } as User} automationEnabled={false} voiceFeatureEnabled={false} />;
            case 'notifications':
                return <NotificationPanel />;
            case 'notification-settings':
                return <NotificationPreferences standalone={true} />;
            case 'settings':
                return user ? (
                    <Settings user={user} onUpdate={(updatedUser) => {
                        console.log('User updated:', updatedUser);
                    }} />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
                    </div>
                );
            default:
                return <OwnerListingManager listings={listings} onOpenAddListingModal={() => setIsFormOpen(true)} onEditListing={onEditListing} onDeleteListing={onDeleteListing} />;
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
                role="Landlord"
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
                                    {user?.name || user?.email || 'Manage your rental properties and tenants'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {tenants.length > 0 && (
                                    <button
                                        onClick={handleDownloadTenantReport}
                                        disabled={isDownloadingReport}
                                        className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        title="Download tenant report"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                                        </svg>
                                        {isDownloadingReport ? 'Preparing...' : 'Download Tenant Report'}
                                    </button>
                                )}
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
        </div>
    );
};
