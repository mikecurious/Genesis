import React from 'react';
import { Technician } from '../../../types';

interface TechnicianListProps {
    technicians: Technician[];
}

export const TechnicianList: React.FC<TechnicianListProps> = ({ technicians }) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Providers</h3>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    + Add Provider
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technicians.map((tech) => (
                    <div key={tech.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                            {tech.specialty === 'Plumbing' && '🔧'}
                            {tech.specialty === 'Electrical' && '⚡'}
                            {tech.specialty === 'HVAC' && '❄️'}
                            {tech.specialty === 'General' && '🔨'}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{tech.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tech.specialty} • {tech.rating} ⭐</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${tech.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tech.availability}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
