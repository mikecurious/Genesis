
import React from 'react';
import { type MaintenanceRequest } from '../../../types';

interface CombinedMaintenanceProps {
    requests: MaintenanceRequest[];
}

const statusColorMap = {
    Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const CombinedMaintenance: React.FC<CombinedMaintenanceProps> = ({ requests }) => {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Tenant Maintenance Requests ({requests.length})</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Tenant</th>
                            <th scope="col" className="px-6 py-3">Unit</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? requests.map(req => (
                            <tr key={req.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4">{req.submittedDate}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{req.tenantName}</td>
                                <td className="px-6 py-4">{req.unit}</td>
                                <td className="px-6 py-4 max-w-sm truncate">{req.description}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColorMap[req.status]}`}>{req.status}</span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No maintenance requests have been submitted.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
