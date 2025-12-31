import React from 'react';
import { MaintenanceRequest } from '../../../types';

interface MaintenanceCenterProps {
    requests: MaintenanceRequest[];
    onAssignTechnician: (requestId: string) => void;
}

const priorityColorMap = {
    Low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    Emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusColorMap = {
    Submitted: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    'In Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    Resolved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
};

export const MaintenanceCenter: React.FC<MaintenanceCenterProps> = ({ requests, onAssignTechnician }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Requests</h3>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none group">
                        <button className="w-full md:w-auto px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            Filter
                        </button>
                        {/* Dropdown menu could go here in a real implementation */}
                    </div>
                    <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColorMap[req.status]}`}>
                                {req.status}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${priorityColorMap[req.priority || 'Low']}`}>
                                {req.priority || 'Low'} Priority
                            </span>
                        </div>

                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{req.category || 'General Issue'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{req.description}</p>

                        {req.aiAnalysis && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4 border border-green-100 dark:border-green-800/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">🤖</span>
                                    <span className="text-xs font-bold text-indigo-800 dark:text-green-300 uppercase">AI Analysis</span>
                                </div>
                                <p className="text-xs text-green-700 dark:text-green-300">{req.aiAnalysis.summary}</p>
                                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mt-1">Suggestion: {req.aiAnalysis.suggestedAction}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <p className="font-medium text-gray-900 dark:text-white">{req.tenantName}</p>
                                <p>{req.unit}</p>
                            </div>
                            <button
                                onClick={() => onAssignTechnician(req.id)}
                                className="text-sm font-medium text-green-600 hover:text-indigo-800 dark:hover:text-green-400"
                            >
                                {req.technicianId ? 'View Technician' : 'Assign Technician'} &rarr;
                            </button>
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p>No active maintenance requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
