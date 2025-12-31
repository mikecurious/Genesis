import React from 'react';
import { UserRole } from '../../types';

export type DashboardSection =
    | 'overview'
    | 'analytics'
    | 'chat'
    | 'marketing'
    | 'automation'
    | 'ai-manager' // NEW: AI Property Manager
    | 'leads'
    | 'ai-settings'
    | 'notifications'
    | 'settings'
    | 'profile' // Added profile
    | 'verification'; // NEW: Verification Center

interface DashboardSidebarProps {
    activeSection: DashboardSection;
    onSectionChange: (section: DashboardSection) => void;
    isOpen: boolean;
    onClose: () => void;
    role?: string; // Added role prop
}

// SVG Icon Components
const ListIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
);

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);

const MarketingIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
);

const AiIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);

const AutomationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
);

const AiManagerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
);

const AnalyticsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);

const LeadsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

const NotificationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const VerificationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

const allSections = [
    { id: 'overview' as DashboardSection, label: 'My Listings', icon: ListIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'leads' as DashboardSection, label: 'Leads', icon: LeadsIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'chat' as DashboardSection, label: 'Client Chat', icon: ChatIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'verification' as DashboardSection, label: 'Verification Center', icon: VerificationIcon, roles: ['Agent', 'Property Seller', 'Property Owner'] }, // NEW: Verification Center
    { id: 'ai-manager' as DashboardSection, label: 'AI Manager', icon: AiManagerIcon, roles: ['Agent', 'Landlord'] }, // Agent & Landlord only
    { id: 'automation' as DashboardSection, label: 'Automation', icon: AutomationIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'marketing' as DashboardSection, label: 'Marketing', icon: MarketingIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'ai-settings' as DashboardSection, label: 'AI Settings', icon: AiIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'analytics' as DashboardSection, label: 'Analytics', icon: AnalyticsIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'notifications' as DashboardSection, label: 'Notifications', icon: NotificationIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
    { id: 'settings' as DashboardSection, label: 'Settings', icon: SettingsIcon, roles: ['Agent', 'Landlord', 'Property Seller', 'Property Owner'] },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    activeSection,
    onSectionChange,
    isOpen,
    onClose,
    role = 'Agent' // Default to Agent if not provided
}) => {
    // Filter sections based on role
    const visibleSections = allSections.filter(section => section.roles.includes(role));

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Navigate your workspace</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {visibleSections.map((section) => {
                        const IconComponent = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => {
                                    onSectionChange(section.id);
                                    onClose();
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeSection === section.id
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <IconComponent />
                                <span className="font-medium">{section.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center gap-2">
                        <img src="/logo@Dashboard.png" alt="MyGF AI" className="h-8 w-auto" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
};
