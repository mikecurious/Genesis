import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalyticsProps {
    userId?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [leadAnalytics, setLeadAnalytics] = useState<any>(null);
    const [propertyAnalytics, setPropertyAnalytics] = useState<any>(null);
    const [trends, setTrends] = useState<any>(null);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch all analytics data
            const [overviewRes, leadsRes, propertiesRes, trendsRes] = await Promise.all([
                fetch('/api/analytics/overview', { headers }),
                fetch('/api/analytics/leads', { headers }),
                fetch('/api/analytics/properties', { headers }),
                fetch('/api/analytics/trends', { headers })
            ]);

            const [overviewData, leadsData, propertiesData, trendsData] = await Promise.all([
                overviewRes.json(),
                leadsRes.json(),
                propertiesRes.json(),
                trendsRes.json()
            ]);

            setOverview(overviewData.data);
            setLeadAnalytics(leadsData.data);
            setPropertyAnalytics(propertiesData.data);
            setTrends(trendsData.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Chart configurations
    const leadsOverTimeData = {
        labels: leadAnalytics?.leadsOverTime?.map((d: any) => d._id) || [],
        datasets: [
            {
                label: 'Leads',
                data: leadAnalytics?.leadsOverTime?.map((d: any) => d.count) || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const leadsByDealTypeData = {
        labels: leadAnalytics?.leadsByDealType?.map((d: any) =>
            d._id.charAt(0).toUpperCase() + d._id.slice(1)
        ) || [],
        datasets: [
            {
                label: 'Leads by Type',
                data: leadAnalytics?.leadsByDealType?.map((d: any) => d.count) || [],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ]
            }
        ]
    };

    const topPropertiesData = {
        labels: leadAnalytics?.leadsByProperty?.slice(0, 5).map((p: any) => p.propertyTitle) || [],
        datasets: [
            {
                label: 'Leads',
                data: leadAnalytics?.leadsByProperty?.slice(0, 5).map((p: any) => p.leadCount) || [],
                backgroundColor: 'rgba(99, 102, 241, 0.8)'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Track your performance and insights</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                </select>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Properties</p>
                            <p className="text-4xl font-bold mt-2">{overview?.totalProperties || 0}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Leads</p>
                            <p className="text-4xl font-bold mt-2">{overview?.totalLeads || 0}</p>
                            <p className="text-green-100 text-xs mt-1">+{overview?.leadsThisMonth || 0} this month</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
                            <p className="text-4xl font-bold mt-2">{overview?.conversionRate || 0}%</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Notifications</p>
                            <p className="text-4xl font-bold mt-2">{overview?.notifications?.unread || 0}</p>
                            <p className="text-orange-100 text-xs mt-1">Unread messages</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Over Time */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads Over Time</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={leadsOverTimeData} options={chartOptions} />
                    </div>
                </div>

                {/* Leads by Deal Type */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads by Deal Type</h3>
                    <div style={{ height: '300px' }}>
                        <Doughnut data={leadsByDealTypeData} options={{ ...chartOptions, scales: undefined }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
                {/* Top Properties */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Properties</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={topPropertiesData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Property Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Performance Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Property</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Leads</th>
                            </tr>
                        </thead>
                        <tbody>
                            {propertyAnalytics?.topProperties?.map((property: any, index: number) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{property.title}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{property.location}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{property.price}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-indigo-800 dark:text-green-300">
                                            {property.leadCount} leads
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
