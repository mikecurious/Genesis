import React from 'react';
import { Technician, ServiceProvider } from '../../../types';

interface TechnicianListProps {
    technicians: Technician[] | ServiceProvider[];
    onAddProvider: () => void;
    onRefresh?: () => void;
}

export const TechnicianList: React.FC<TechnicianListProps> = ({ technicians, onAddProvider, onRefresh }) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Providers</h3>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Refresh"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                </div>
                <button
                    onClick={onAddProvider}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Provider
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technicians.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">No service providers yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Click "Add Provider" to add your first service provider</p>
                    </div>
                ) : (
                    technicians.map((tech) => {
                        const techId = 'id' in tech ? tech.id : tech._id || '';
                        return (
                            <div key={techId} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                                    {tech.specialty === 'Plumbing' && '🔧'}
                                    {tech.specialty === 'Electrical' && '⚡'}
                                    {tech.specialty === 'HVAC' && '❄️'}
                                    {tech.specialty === 'General' && '🔨'}
                                    {tech.specialty === 'Carpentry' && '🪚'}
                                    {tech.specialty === 'Painting' && '🎨'}
                                    {tech.specialty === 'Roofing' && '🏠'}
                                    {tech.specialty === 'Landscaping' && '🌳'}
                                    {tech.specialty === 'Cleaning' && '🧹'}
                                    {tech.specialty === 'Security' && '🔒'}
                                    {tech.specialty === 'Other' && '🛠️'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{tech.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {tech.specialty} • {tech.rating.toFixed(1)} ⭐
                                        {'phone' in tech && ` • ${tech.phone}`}
                                    </p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                                    tech.availability === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    tech.availability === 'Busy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                    {tech.availability}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
