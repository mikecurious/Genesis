import React, { useState, useEffect } from 'react';
import { type Lead } from '../../types';
import { leadService } from '../../services/apiService';

interface LeadViewerProps {
    onClose?: () => void;
}

export const LeadViewer: React.FC<LeadViewerProps> = ({ onClose }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDealType, setFilterDealType] = useState<string>('all');

    useEffect(() => {
        fetchLeads();
    }, [filterStatus, filterDealType]);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const filters: any = {};
            if (filterStatus !== 'all') filters.status = filterStatus;
            if (filterDealType !== 'all') filters.dealType = filterDealType;

            const { data } = await leadService.getLeads(filters);
            setLeads(data.data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (leadId: string, newStatus: string) => {
        try {
            await leadService.updateLead(leadId, { status: newStatus });
            fetchLeads();
        } catch (error) {
            console.error('Failed to update lead:', error);
        }
    };

    const getDealTypeIcon = (dealType: string) => {
        switch (dealType) {
            case 'purchase':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'rental':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                );
            case 'viewing':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'contacted':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'in-progress':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'closed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'lost':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {leads.length} total leads
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                </select>

                <select
                    value={filterDealType}
                    onChange={(e) => setFilterDealType(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="rental">Rental</option>
                    <option value="viewing">Viewing</option>
                </select>
            </div>

            {/* Leads List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">No leads found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedLead(lead)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-green-600 dark:text-green-400">
                                            {getDealTypeIcon(lead.dealType)}
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {lead.client.name}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <p>
                                            <span className="font-medium">Property:</span>{' '}
                                            {typeof lead.property === 'object' ? lead.property.title : 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Contact:</span> {lead.client.contact}
                                        </p>
                                        <p>
                                            <span className="font-medium">Email:</span> {lead.client.email}
                                        </p>
                                        <p>
                                            <span className="font-medium">WhatsApp:</span> {lead.client.whatsappNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </p>
                                    <select
                                        value={lead.status}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleUpdateStatus(lead.id, e.target.value);
                                        }}
                                        className="mt-2 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="closed">Closed</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lead Detail Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Lead Details
                                </h3>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Client Information</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedLead.client.name}</p>
                                        <p><span className="font-medium">Email:</span> {selectedLead.client.email}</p>
                                        <p><span className="font-medium">Phone:</span> {selectedLead.client.contact}</p>
                                        <p><span className="font-medium">WhatsApp:</span> {selectedLead.client.whatsappNumber}</p>
                                        <p><span className="font-medium">Address:</span> {selectedLead.client.address}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Property</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <p className="font-medium">
                                            {typeof selectedLead.property === 'object' ? selectedLead.property.title : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {selectedLead.conversationHistory && selectedLead.conversationHistory.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            Conversation History ({selectedLead.conversationHistory.length} messages)
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                                            {selectedLead.conversationHistory.map((msg, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="font-medium">
                                                        {msg.role === 'user' ? 'Client' : 'AI'}:
                                                    </span>{' '}
                                                    {msg.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
