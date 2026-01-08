import React, { useState } from 'react';
import { type Listing, type Message, type User, type NewListingInput } from '../../../types';
import { OwnerListingManager } from '../owner/OwnerListingManager';
import { OwnerClientChat } from '../owner/OwnerClientChat';
import { OwnerMarketing } from '../owner/OwnerMarketing';
import { OwnerAiSettings } from '../owner/OwnerAiSettings';
import { ListingForm } from '../ListingForm';
import { Settings } from '../ProfileSettings';
import { NotificationBadge } from '../NotificationBadge';
import { NotificationPanel } from '../NotificationPanel';
import { DashboardSidebar, DashboardSection } from '../DashboardSidebar';
import { MenuIcon } from '../../icons/MenuIcon';
import { LeadViewer } from '../LeadViewer';
import { AutomationDashboard } from '../../AutomationDashboard';
import { VerificationCenter } from '../verification/VerificationCenter';

interface SellerDashboardProps {
    user?: User;
    listings: Listing[];
    onAddListing: (newListing: NewListingInput) => void;
    onEditListing?: (propertyId: string, updatedData: Partial<Omit<Listing, 'id' | 'imageUrls'>>) => Promise<void>;
    onDeleteListing?: (propertyId: string) => Promise<void>;
    interactionChats: Record<string, Message[]>;
    humanTakeoverChats: Record<string, boolean>;
    onTakeoverChat: (propertyId: string) => void;
    onSendAgentMessage: (propertyId: string, text: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
    user, listings, onAddListing, onEditListing, onDeleteListing, interactionChats, humanTakeoverChats, onTakeoverChat, onSendAgentMessage
}) => {
    const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAddListingSubmit = (newListing: NewListingInput) => {
        onAddListing(newListing);
        setIsFormOpen(false);
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
            case 'automation':
                return <AutomationDashboard user={user || { id: 'demo', name: 'Demo User', email: 'demo@example.com', role: 'Property Seller' } as User} automationEnabled={false} voiceFeatureEnabled={false} />;
            case 'notifications':
                return <NotificationPanel />;
            case 'verification':
                return <VerificationCenter userId={user?.id || user?._id || ''} userProperties={listings} />;
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
                role="Property Seller"
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white">Dashboard</span>
                    <NotificationBadge onViewAll={() => setActiveSection('notifications')} />
                </div>

                {/* Desktop Header (Welcome Message) */}
                <header className="hidden md:flex items-center justify-between px-8 py-6 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Welcome back, {user?.name?.split(' ')[0] || 'Seller'}!
                            <span className="text-yellow-500 animate-wave inline-block origin-bottom-right">👋</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage your property sales and track performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBadge onViewAll={() => setActiveSection('notifications')} />
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>

            <ListingForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onAddListing={handleAddListingSubmit}
                onRequireVerification={() => setActiveSection('verification')}
                userRole={user?.role}
            />
        </div>
    );
};
