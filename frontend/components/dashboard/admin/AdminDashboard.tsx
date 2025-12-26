import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import type { User } from '../../../types';

interface AdminDashboardProps {
    user: User;
}

type TabType = 'overview' | 'users' | 'properties' | 'leads' | 'activity' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [activity, setActivity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [announcement, setAnnouncement] = useState('');
    const [surveyorData, setSurveyorData] = useState({ name: '', email: '', password: '', phone: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [analyticsData, usersData, propertiesData, leadsData, activityData] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getAllUsers(),
                adminService.getAllProperties(),
                adminService.getAllLeads(),
                adminService.getActivityLogs(),
            ]);
            setAnalytics(analyticsData.data);
            setUsers(usersData.data);
            setProperties(propertiesData.data);
            setLeads(leadsData.data);
            setActivity(activityData.data);
        } catch (error: any) {
            console.error('Error loading admin data:', error);
            alert('Failed to load admin data: ' + error.message);
        } finally {
            setLoading(false);
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🛡️ Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name}! Manage your entire system.</p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <nav className="flex space-x-8 min-w-max">
                    {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'users', label: 'Users', icon: '👥' },
                        { id: 'properties', label: 'Properties', icon: '🏠' },
                        { id: 'leads', label: 'Leads', icon: '📈' },
                        { id: 'activity', label: 'Activity', icon: '📋' },
                        { id: 'settings', label: 'Settings', icon: '⚙️' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
                <div className="space-y-6 animate-fade-in">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                                    <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{analytics.users.total}</p>
                                    <p className="text-sm text-gray-500 mt-1">{analytics.users.verified} verified</p>
                                </div>
                                <div className="text-4xl">👥</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                                    <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{analytics.properties.total}</p>
                                    <p className="text-sm text-gray-500 mt-1">{analytics.properties.active} active</p>
                                </div>
                                <div className="text-4xl">🏠</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                                    <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{analytics.leads.total}</p>
                                </div>
                                <div className="text-4xl">📈</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                                    <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">${analytics.revenue.total}</p>
                                </div>
                                <div className="text-4xl">💰</div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Users by Role</h3>
                            <div className="space-y-3">
                                {analytics.users.byRole.map((role: any) => (
                                    <div key={role._id} className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{role._id || 'Unassigned'}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{role.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Basic Plan</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">${analytics.revenue.breakdown.basic}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">MyGF 1.3</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">${analytics.revenue.breakdown.mygf13}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">MyGF 3.2</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">${analytics.revenue.breakdown.mygf32}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-fade-in">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Users ({users.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verified</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((u: any) => (
                                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.role || 'None'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                u.accountStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                u.accountStatus === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {u.accountStatus || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                u.isVerified ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}>
                                                {u.isVerified ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            {u.accountStatus !== 'suspended' && u.role !== 'Admin' && (
                                                <button
                                                    onClick={() => handleSuspendUser(u._id, u.name)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {u.accountStatus === 'suspended' && (
                                                <button
                                                    onClick={() => handleReactivateUser(u._id, u.name)}
                                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium"
                                                >
                                                    Reactivate
                                                </button>
                                            )}
                                            {u.role !== 'Admin' && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id, u.name)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
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
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-fade-in">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Properties ({properties.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Owner</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Moderation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {properties.map((p: any) => (
                                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">{p.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{p.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.createdBy?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                p.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                p.moderationStatus === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                p.moderationStatus === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                p.moderationStatus === 'flagged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {p.moderationStatus || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            {p.moderationStatus !== 'approved' && (
                                                <button
                                                    onClick={() => handleModerateProperty(p._id, 'approve', p.title)}
                                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleModerateProperty(p._id, 'flag', p.title)}
                                                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
                                            >
                                                Flag
                                            </button>
                                            <button
                                                onClick={() => handleModerateProperty(p._id, 'reject', p.title)}
                                                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                            >
                                                Reject
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => handleDeleteProperty(p._id, p.title)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
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
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-fade-in">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Leads ({leads.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deal Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {leads.map((lead: any) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lead.client?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{lead.client?.email || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.client?.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{lead.property?.title || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{lead.dealType || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                lead.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                lead.status === 'converted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && activity && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Property Moderations</h3>
                        <div className="space-y-3">
                            {activity.moderations.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No moderation activity yet</p>
                            ) : (
                                activity.moderations.map((mod: any) => (
                                    <div key={mod._id} className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{mod.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Moderated by {mod.moderatedBy?.name} - {mod.moderationStatus}
                                            </p>
                                            {mod.moderationNote && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Note: {mod.moderationNote}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(mod.moderatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent User Suspensions</h3>
                        <div className="space-y-3">
                            {activity.suspensions.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">No suspension activity yet</p>
                            ) : (
                                activity.suspensions.map((susp: any) => (
                                    <div key={susp._id} className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{susp.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{susp.email}</p>
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Reason: {susp.suspensionReason}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
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
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📢 Send System Announcement</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Send a notification to all users in the system
                        </p>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Enter your announcement message..."
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={4}
                        />
                        <button
                            onClick={handleSendAnnouncement}
                            disabled={!announcement.trim()}
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Send Announcement
                        </button>
                    </div>

                    {/* Create Surveyor */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">👷 Create Surveyor Account</h3>
                        <form onSubmit={handleCreateSurveyor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={surveyorData.name}
                                    onChange={(e) => setSurveyorData({ ...surveyorData, name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={surveyorData.email}
                                    onChange={(e) => setSurveyorData({ ...surveyorData, email: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                                <input
                                    type="password"
                                    value={surveyorData.password}
                                    onChange={(e) => setSurveyorData({ ...surveyorData, password: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={surveyorData.phone}
                                    onChange={(e) => setSurveyorData({ ...surveyorData, phone: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                Create Surveyor Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
