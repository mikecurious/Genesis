import React from 'react';
import { Tenant } from '../../../types';

interface TenantListProps {
    tenants: Tenant[];
    onAddTenant: () => void;
    onViewDetails: (tenant: Tenant) => void;
}

const statusColorMap = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const TenantList: React.FC<TenantListProps> = ({ tenants, onAddTenant, onViewDetails }) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Tenants</h3>
                <button
                    onClick={onAddTenant}
                    className="w-full md:w-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Tenant
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {tenants.map((tenant) => (
                    <div key={tenant.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                                    {tenant.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{tenant.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.unit}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColorMap[tenant.rentStatus]}`}>
                                {tenant.rentStatus}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Rent:</span>
                                <span className="font-medium">${tenant.rentAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Contact:</span>
                                <span>{tenant.phone}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => onViewDetails(tenant)}
                            className="w-full py-2 text-center text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg font-medium text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                        >
                            Manage Tenant
                        </button>
                    </div>
                ))}
                {tenants.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p>No tenants yet.</p>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Unit</th>
                                <th className="px-6 py-4 font-semibold">Contact</th>
                                <th className="px-6 py-4 font-semibold">Rent</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xs">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{tenant.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{tenant.unit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span>{tenant.email}</span>
                                            <span className="text-xs text-gray-400">{tenant.whatsappNumber || tenant.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">${tenant.rentAmount?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColorMap[tenant.rentStatus]}`}>
                                            {tenant.rentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewDetails(tenant)}
                                            className="text-green-600 hover:text-indigo-900 dark:hover:text-green-400 font-medium text-sm"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tenants.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            <p className="text-lg font-medium">No tenants yet</p>
                                            <p className="text-sm mt-1">Add your first tenant to start AI management</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
