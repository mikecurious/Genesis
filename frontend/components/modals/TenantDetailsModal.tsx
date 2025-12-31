import React, { useState } from 'react';
import { Tenant } from '../../types';

interface TenantDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: Tenant | null;
    onUpdateTenant?: (tenantId: string, updates: Partial<Tenant>) => void;
    onDeleteTenant?: (tenantId: string) => void;
}

export const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({
    isOpen,
    onClose,
    tenant,
    onUpdateTenant,
    onDeleteTenant,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTenant, setEditedTenant] = useState<Partial<Tenant>>({});

    if (!isOpen || !tenant) return null;

    const handleEdit = () => {
        setIsEditing(true);
        setEditedTenant(tenant);
    };

    const handleSave = () => {
        if (onUpdateTenant && editedTenant) {
            onUpdateTenant(tenant.id, editedTenant);
        }
        setIsEditing(false);
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to remove ${tenant.name} as a tenant?`)) {
            if (onDeleteTenant) {
                onDeleteTenant(tenant.id);
            }
            onClose();
        }
    };

    const statusColorMap = {
        Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-2xl">
                            {tenant.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {tenant.name}
                            </h3>
                            <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${statusColorMap[tenant.rentStatus]}`}>
                                {tenant.rentStatus}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                                <p className="text-gray-900 dark:text-white font-medium">{tenant.email}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Phone</label>
                                <p className="text-gray-900 dark:text-white font-medium">{tenant.phone}</p>
                            </div>
                            {tenant.whatsappNumber && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <label className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{tenant.whatsappNumber}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Details */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Unit</label>
                                <p className="text-gray-900 dark:text-white font-medium">{tenant.unit}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <label className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</label>
                                <p className="text-gray-900 dark:text-white font-medium text-xl">
                                    ${tenant.rentAmount?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lease Information */}
                    {(tenant.leaseStart || tenant.leaseEnd || tenant.deposit || tenant.paymentDay) && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lease Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tenant.leaseStart && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Lease Start</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {new Date(tenant.leaseStart).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {tenant.leaseEnd && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Lease End</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {new Date(tenant.leaseEnd).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {tenant.deposit && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Security Deposit</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            ${tenant.deposit.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {tenant.paymentDay && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Payment Due Day</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            Day {tenant.paymentDay} of each month
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Status */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status</h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
                                    <p className={`text-xl font-bold ${
                                        tenant.rentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' :
                                        tenant.rentStatus === 'Due' ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-red-600 dark:text-red-400'
                                    }`}>
                                        {tenant.rentStatus}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount Due</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${tenant.rentAmount?.toLocaleString() || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        Remove Tenant
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Edit Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
