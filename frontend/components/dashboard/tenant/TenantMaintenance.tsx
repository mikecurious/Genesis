
import React, { useState } from 'react';
import { type MaintenanceRequest } from '../../../types';

interface TenantMaintenanceProps {
    requests: MaintenanceRequest[];
    onAddRequest: (request: { description: string }) => void;
}

const statusColorMap = {
    Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const TenantMaintenance: React.FC<TenantMaintenanceProps> = ({ requests, onAddRequest }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        onAddRequest({ description });
        setDescription('');
    };
    
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Submit a New Maintenance Request</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Describe the issue</label>
                    <textarea 
                        id="description" 
                        rows={4} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" 
                        placeholder="e.g., The kitchen sink is leaking."
                        required
                    ></textarea>
                    <button type="submit" className="mt-4 w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors">Submit Request</button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Your Maintenance History</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Issue</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                         <tbody>
                            {requests.length > 0 ? requests.map(req => (
                                <tr key={req.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4">{req.submittedDate}</td>
                                    <td className="px-6 py-4 max-w-sm truncate">{req.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColorMap[req.status]}`}>{req.status}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">You have not submitted any maintenance requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
