
import React, { useState } from 'react';
import { type Tenant, type MaintenanceRequest, type User } from '../../../types';
import { TenantAiChat } from './TenantAiChat';
import { TenantPayments } from './TenantPayments';
import { TenantMaintenance } from './TenantMaintenance';
import { TenantSettings } from './TenantSettings';
import { ProfileSettings } from '../ProfileSettings';
import { NotificationBadge } from '../NotificationBadge';
import { NotificationPanel } from '../NotificationPanel';

interface TenantDashboardProps {
    user?: User; // NEW
    tenant?: Tenant | null;
    maintenanceRequests: MaintenanceRequest[];
    onAddRequest: (request: Omit<MaintenanceRequest, 'id' | 'tenantId' | 'tenantName' | 'unit' | 'submittedDate' | 'status'>) => void;
}

type TenantDashboardTab = 'chat' | 'payments' | 'maintenance' | 'settings' | 'notifications' | 'profile';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${active
            ? 'border-green-500 text-gray-900 dark:text-white'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500'
            }`}
    >
        {children}
    </button>
);

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ user, tenant, maintenanceRequests, onAddRequest }) => {
    const [activeTab, setActiveTab] = useState<TenantDashboardTab>('chat');

    if (!tenant) {
        return <div className="p-8 text-center">Loading tenant information...</div>;
    }

    const tenantRequests = maintenanceRequests.filter(r => r.tenantId === tenant.userId);

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return <TenantAiChat tenant={tenant} maintenanceRequests={tenantRequests} />;
            case 'payments':
                return <TenantPayments tenant={tenant} />;
            case 'maintenance':
                return <TenantMaintenance requests={tenantRequests} onAddRequest={onAddRequest} />;
            case 'settings':
                return <TenantSettings />;
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
            <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col flex-1">
                <header className="mb-8 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                Welcome, {tenant.name}
                                <span className="text-yellow-500 animate-wave inline-block origin-bottom-right">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                            </h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                {user?.role && <span className="font-semibold">{user.role}</span>}
                                {user?.role && tenant.unit && <span> • </span>}
                                {tenant.unit || 'Your tenant portal'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBadge onViewAll={() => setActiveTab('notifications')} />
                        </div>
                    </div>
                </header>

                <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex-shrink-0">
                    <nav className="flex space-x-2 md:space-x-4 flex-wrap">
                        <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>AI Chat</TabButton>
                        <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>Payments</TabButton>
                        <TabButton active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')}>Maintenance</TabButton>
                        <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>Notifications</TabButton>
                        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</TabButton>
                        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>Profile</TabButton>
                    </nav>
                </div>

                <main className="flex-1 overflow-y-auto pb-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
