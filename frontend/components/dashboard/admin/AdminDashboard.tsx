import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { providerService, surveyorService } from '../../../services/apiService';
import type { User, ServiceProvider } from '../../../types';
import { AddProviderModal } from '../../modals/AddProviderModal';

interface AdminDashboardProps {
    user: User;
}

type TabType = 'overview' | 'users' | 'properties' | 'leads' | 'providers' | 'activity' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [surveyors, setSurveyors] = useState<any[]>([]);
    const [activity, setActivity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [announcement, setAnnouncement] = useState('');
    const [surveyorData, setSurveyorData] = useState({ name: '', email: '', password: '', phone: '' });
    const [isAddProviderModalOpen, setIsAddProviderModalOpen] = useState(false);
    const [providerFilter, setProviderFilter] = useState<'all' | 'providers' | 'surveyors'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [analyticsData, usersData, propertiesData, leadsData, providersData, surveyorsData, activityData] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getAllUsers(),
                adminService.getAllProperties(),
                adminService.getAllLeads(),
                providerService.getProviders(),
                surveyorService.getSurveyors(),
                adminService.getActivityLogs(),
            ]);
            setAnalytics(analyticsData.data);
            setUsers(usersData.data);
            setProperties(propertiesData.data);
            setLeads(leadsData.data);
            setProviders(providersData.data.data || []);
            setSurveyors(surveyorsData.data.data || surveyorsData.data || []);
            setActivity(activityData.data);
        } catch (error: any) {
            console.error('Error loading admin data:', error);
            alert('Failed to load admin data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProvider = async (providerData: Partial<ServiceProvider>) => {
        try {
            await providerService.createProvider(providerData);
            await loadData();
            setIsAddProviderModalOpen(false);
        } catch (error: any) {
            alert('Failed to add provider: ' + error.message);
        }
    };

    const handleDeleteProvider = async (providerId: string, providerName: string) => {
        if (confirm(`Are you sure you want to DELETE "${providerName}"? This action cannot be undone.`)) {
            try {
                await providerService.deleteProvider(providerId);
                alert('Provider deleted successfully');
                await loadData();
            } catch (error: any) {
                alert('Failed to delete provider: ' + error.message);
            }
        }
    };

    const handleUpdateProviderStatus = async (providerId: string, availability: string) => {
        try {
            await providerService.updateAvailability(providerId, availability);
            await loadData();
        } catch (error: any) {
            alert('Failed to update provider status: ' + error.message);
        }
    };

    const handleSuspendUser = async (userId: string, userName: string) => {
        const reason = prompt(`Enter reason for suspending ${userName}:`);
        if (reason) {
            try {
                await adminService.suspendUser(userId, reason);
                alert('User suspended successfully');
                await loadData();
            } catch (error) {
                alert('Failed to suspend user');
            }
        }
    };

    const handleReactivateUser = async (userId: string, userName: string) => {
        if (confirm(`Reactivate ${userName}?`)) {
            try {
                await adminService.reactivateUser(userId);
                alert('User reactivated successfully');
                await loadData();
            } catch (error) {
                alert('Failed to reactivate user');
            }
        }
    };

    const handleVerifyUser = async (userId: string, userName: string) => {
        if (confirm(`Verify ${userName}? This will give them full access to the platform.`)) {
            try {
                await adminService.verifyUser(userId);
                alert('User verified successfully! They can now access the platform.');
                await loadData();
            } catch (error: any) {
                alert('Failed to verify user: ' + error.message);
            }
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (confirm(`Are you sure you want to DELETE ${userName}? This action cannot be undone.`)) {
            try {
                await adminService.deleteUser(userId);
                alert('User deleted successfully');
                await loadData();
            } catch (error: any) {
                alert('Failed to delete user: ' + error.message);
            }
        }
    };

    const handleModerateProperty = async (propertyId: string, action: 'approve' | 'reject' | 'flag', title: string) => {
        const note = action !== 'approve' ? prompt(`Enter ${action} reason for "${title}":`) : null;
        if (action === 'approve' || note) {
            try {
                await adminService.moderateProperty(propertyId, action, note || undefined);
                alert(`Property ${action}ed successfully`);
                await loadData();
            } catch (error) {
                alert(`Failed to ${action} property`);
            }
        }
    };

    const handleDeleteProperty = async (propertyId: string, title: string) => {
        if (confirm(`Are you sure you want to DELETE "${title}"? This action cannot be undone.`)) {
            try {
                await adminService.deleteProperty(propertyId);
                alert('Property deleted successfully');
                await loadData();
            } catch (error) {
                alert('Failed to delete property');
            }
        }
    };

    const handleSendAnnouncement = async () => {
        if (!announcement.trim()) {
            alert('Please enter an announcement message');
            return;
        }
        if (confirm('Send this announcement to ALL users?')) {
            try {
                await adminService.sendAnnouncement(announcement);
                alert('Announcement sent successfully!');
                setAnnouncement('');
            } catch (error) {
                alert('Failed to send announcement');
            }
        }
    };

    const handleCreateSurveyor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!surveyorData.name || !surveyorData.email || !surveyorData.password) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            await adminService.createSurveyor(surveyorData);
            alert('Surveyor account created successfully!');
            setSurveyorData({ name: '', email: '', password: '', phone: '' });
        } catch (error: any) {
            alert('Failed to create surveyor: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                                <span className="text-4xl">🛡️</span>
                                Admin Control Center
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.name} • System Administrator</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={loadData}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-[1600px] mx-auto px-6">
                    <nav className="flex space-x-1 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: '📊' },
                            { id: 'users', label: `Users (${users.length})`, icon: '👥' },
                            { id: 'properties', label: `Properties (${properties.length})`, icon: '🏠' },
                            { id: 'leads', label: `Leads (${leads.length})`, icon: '📈' },
                            { id: 'providers', label: `Providers (${providers.length + surveyors.length})`, icon: '🛠️' },
                            { id: 'activity', label: 'Activity Logs', icon: '📋' },
                            { id: 'settings', label: 'Settings', icon: '⚙️' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`py-4 px-6 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && analytics && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Users</p>
                                        <p className="text-4xl font-bold mt-2">{analytics.users.total}</p>
                                        <p className="text-blue-100 text-sm mt-1">{analytics.users.verified} verified</p>
                                    </div>
                                    <div className="text-6xl opacity-20">👥</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Properties</p>
                                        <p className="text-4xl font-bold mt-2">{analytics.properties.total}</p>
                                        <p className="text-purple-100 text-sm mt-1">{analytics.properties.active} active</p>
                                    </div>
                                    <div className="text-6xl opacity-20">🏠</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">Total Leads</p>
                                        <p className="text-4xl font-bold mt-2">{analytics.leads.total}</p>
                                        <p className="text-green-100 text-sm mt-1">Conversions tracked</p>
                                    </div>
                                    <div className="text-6xl opacity-20">📈</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Revenue</p>
                                        <p className="text-4xl font-bold mt-2">${analytics.revenue.total}</p>
                                        <p className="text-amber-100 text-sm mt-1">From subscriptions</p>
                                    </div>
                                    <div className="text-6xl opacity-20">💰</div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Users by Role</h3>
                                <div className="space-y-4">
                                    {analytics.users.byRole.map((role: any) => (
                                        <div key={role._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{role._id || 'Unassigned'}</span>
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{role.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Revenue Breakdown</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Basic Plan</span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${analytics.revenue.breakdown.basic}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">MyGF 1.3</span>
                                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${analytics.revenue.breakdown.mygf13}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">MyGF 3.2</span>
                                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">${analytics.revenue.breakdown.mygf32}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users and their permissions</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Verified</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((u: any) => (
                                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">{u.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[250px] break-words">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
                                                    {u.role || 'None'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    u.accountStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    u.accountStatus === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {u.accountStatus || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    u.isVerified ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                    {u.isVerified ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                                {!u.isVerified && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerifyUser(u._id, u.name)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline"
                                                        >
                                                            ✓ Verify
                                                        </button>
                                                        <span className="text-gray-300">•</span>
                                                    </>
                                                )}
                                                {u.accountStatus !== 'suspended' && u.role !== 'Admin' && (
                                                    <button
                                                        onClick={() => handleSuspendUser(u._id, u.name)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold hover:underline"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {u.accountStatus === 'suspended' && (
                                                    <button
                                                        onClick={() => handleReactivateUser(u._id, u.name)}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-semibold hover:underline"
                                                    >
                                                        Reactivate
                                                    </button>
                                                )}
                                                {u.role !== 'Admin' && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id, u.name)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Property Moderation</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Review and moderate all property listings</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Moderation</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {properties.map((p: any) => (
                                        <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white max-w-[250px] truncate" title={p.title}>{p.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={p.location}>{p.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.price}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={p.createdBy?.name}>{p.createdBy?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    p.moderationStatus === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    p.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    p.moderationStatus === 'flagged' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {p.moderationStatus || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                {p.moderationStatus !== 'approved' && (
                                                    <button
                                                        onClick={() => handleModerateProperty(p._id, 'approve', p.title)}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-semibold hover:underline"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleModerateProperty(p._id, 'flag', p.title)}
                                                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-semibold hover:underline"
                                                >
                                                    Flag
                                                </button>
                                                <button
                                                    onClick={() => handleModerateProperty(p._id, 'reject', p.title)}
                                                    className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-semibold hover:underline"
                                                >
                                                    Reject
                                                </button>
                                                <span className="text-gray-300">•</span>
                                                <button
                                                    onClick={() => handleDeleteProperty(p._id, p.title)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Leads Tab */}
                {activeTab === 'leads' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Management</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Track all client leads and conversions</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Property</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Deal Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {leads.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                No leads found
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.map((lead: any) => (
                                            <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white max-w-[150px] truncate" title={lead.client?.name}>{lead.client?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] break-words">{lead.client?.email || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[130px] truncate">{lead.client?.phone || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={lead.property?.title}>{lead.property?.title || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">{lead.dealType || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        lead.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        lead.status === 'converted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Providers Tab */}
                {activeTab === 'providers' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Service Provider Management</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all service providers and surveyors across the platform</p>
                                </div>
                                <button
                                    onClick={() => setIsAddProviderModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Provider
                                </button>
                            </div>
                            {/* Filter Tabs */}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-fit">
                                <button
                                    onClick={() => setProviderFilter('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        providerFilter === 'all'
                                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    All ({providers.length + surveyors.length})
                                </button>
                                <button
                                    onClick={() => setProviderFilter('providers')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        providerFilter === 'providers'
                                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    Service Providers ({providers.length})
                                </button>
                                <button
                                    onClick={() => setProviderFilter('surveyors')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        providerFilter === 'surveyors'
                                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    Surveyors ({surveyors.length})
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Specialty</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {(() => {
                                        const filteredProviders = providerFilter === 'surveyors' ? [] :
                                            providerFilter === 'all' ? providers : providers;
                                        const filteredSurveyors = providerFilter === 'providers' ? [] :
                                            providerFilter === 'all' ? surveyors : surveyors;
                                        const totalFiltered = filteredProviders.length + filteredSurveyors.length;

                                        if (totalFiltered === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className="font-medium">No {providerFilter === 'surveyors' ? 'surveyors' : providerFilter === 'providers' ? 'service providers' : 'providers'} found</p>
                                                                <p className="text-sm mt-1">
                                                                    {providerFilter === 'surveyors'
                                                                        ? 'Go to Settings to create a surveyor account'
                                                                        : 'Click "Add Provider" to add your first service provider'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        const allItems: Array<{type: 'provider' | 'surveyor', data: any}> = [
                                            ...filteredProviders.map((p: any) => ({type: 'provider' as const, data: p})),
                                            ...filteredSurveyors.map((s: any) => ({type: 'surveyor' as const, data: s}))
                                        ];

                                        return allItems.map((item) => {
                                            const isProvider = item.type === 'provider';
                                            const data = item.data;
                                            const profile = isProvider ? data : data.surveyorProfile;

                                            return (
                                                <tr key={data._id || data.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            isProvider
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                        }`}>
                                                            {isProvider ? 'Provider' : 'Surveyor'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-[180px]">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={data.name}>{data.name}</div>
                                                            {isProvider && data.companyName && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={data.companyName}>{data.companyName}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isProvider ? (
                                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-medium">
                                                                {data.specialty}
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1">
                                                                {profile?.specializations?.slice(0, 2).map((spec: string, idx: number) => (
                                                                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">
                                                                        {spec}
                                                                    </span>
                                                                )) || <span className="text-gray-400 text-xs">N/A</span>}
                                                                {(profile?.specializations?.length || 0) > 2 && (
                                                                    <span className="text-xs text-gray-500">+{profile.specializations.length - 2}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px]">
                                                        <div className="truncate" title={data.email}>{data.email}</div>
                                                        <div className="text-xs truncate">{data.phone || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {isProvider ? data.yearsOfExperience : (profile?.yearsOfExperience || 0)} years
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {isProvider ? data.rating.toFixed(1) : (profile?.rating?.toFixed(1) || 'N/A')} {(isProvider || profile?.rating) ? '⭐' : ''}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isProvider ? (
                                                            <select
                                                                value={data.availability}
                                                                onChange={(e) => handleUpdateProviderStatus(data._id || data.id || '', e.target.value)}
                                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                    data.availability === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                    data.availability === 'Busy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                <option value="Available">Available</option>
                                                                <option value="Busy">Busy</option>
                                                                <option value="Inactive">Inactive</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                profile?.availability === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                {profile?.availability || 'N/A'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                        {isProvider && (
                                                            <button
                                                                onClick={() => handleDeleteProvider(data._id || data.id || '', data.name)}
                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                        {!isProvider && (
                                                            <span className="text-gray-500 text-xs italic">Managed via Users</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && activity && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <span>🔍</span> Recent Property Moderations
                            </h3>
                            <div className="space-y-4">
                                {activity.moderations.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No moderation activity yet</p>
                                ) : (
                                    activity.moderations.map((mod: any) => (
                                        <div key={mod._id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white text-lg">{mod.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    Moderated by <span className="font-medium">{mod.moderatedBy?.name}</span> - <span className="font-medium capitalize">{mod.moderationStatus}</span>
                                                </p>
                                                {mod.moderationNote && (
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                                        📝 Note: {mod.moderationNote}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                                                {new Date(mod.moderatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <span>⚠️</span> Recent User Suspensions
                            </h3>
                            <div className="space-y-4">
                                {activity.suspensions.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No suspension activity yet</p>
                                ) : (
                                    activity.suspensions.map((susp: any) => (
                                        <div key={susp._id} className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white text-lg">{susp.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{susp.email}</p>
                                                <p className="text-sm text-red-700 dark:text-red-400 mt-2 font-medium">
                                                    🚫 Reason: {susp.suspensionReason}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                                                {new Date(susp.suspendedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Send Announcement */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-8">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <span>📢</span> Send System Announcement
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Broadcast an important message to all users in the system
                            </p>
                            <textarea
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="Enter your announcement message..."
                                className="w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                                rows={5}
                            />
                            <button
                                onClick={handleSendAnnouncement}
                                disabled={!announcement.trim()}
                                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
                            >
                                Send Announcement to All Users
                            </button>
                        </div>

                        {/* Create Surveyor */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <span>👷</span> Create Surveyor Account
                            </h3>
                            <form onSubmit={handleCreateSurveyor} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={surveyorData.name}
                                            onChange={(e) => setSurveyorData({ ...surveyorData, name: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={surveyorData.email}
                                            onChange={(e) => setSurveyorData({ ...surveyorData, email: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                                        <input
                                            type="password"
                                            value={surveyorData.password}
                                            onChange={(e) => setSurveyorData({ ...surveyorData, password: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={surveyorData.phone}
                                            onChange={(e) => setSurveyorData({ ...surveyorData, phone: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Create Surveyor Account
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <AddProviderModal
                isOpen={isAddProviderModalOpen}
                onClose={() => setIsAddProviderModalOpen(false)}
                onSubmit={handleAddProvider}
            />
        </div>
    );
};
