import React from 'react';

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    badge?: string;
    color?: 'indigo' | 'green' | 'blue' | 'purple' | 'orange';
}

export const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    title,
    description,
    onClick,
    badge,
    color = 'indigo'
}) => {
    const colorClasses = {
        indigo: 'hover:border-green-500 hover:shadow-green-500/20',
        green: 'hover:border-green-500 hover:shadow-green-500/20',
        blue: 'hover:border-blue-500 hover:shadow-blue-500/20',
        purple: 'hover:border-purple-500 hover:shadow-purple-500/20',
        orange: 'hover:border-orange-500 hover:shadow-orange-500/20'
    };

    return (
        <button
            onClick={onClick}
            className={`relative group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${colorClasses[color]} text-left w-full`}
        >
            {badge && (
                <span className="absolute top-3 right-3 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                    {badge}
                </span>
            )}

            <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>

                <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
};
