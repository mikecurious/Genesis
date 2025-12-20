
import React from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { ConnectIcon } from './icons/ConnectIcon';
import { InsightsIcon } from './icons/InsightsIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SecureIcon } from './icons/SecureIcon';

const features = [
    {
        icon: <SearchIcon />,
        title: 'Smart Property Search',
        description: 'Instantly find homes or rentals that match your preferences using AI-powered filters.'
    },
    {
        icon: <ConnectIcon />,
        title: 'Agent & Owner Connect',
        description: 'Seamlessly connect with tenants, buyers, agents, and landlords through intelligent recommendations.'
    },
    {
        icon: <InsightsIcon />,
        title: 'AI-Powered Insights',
        description: 'Get pricing trends, area comparisons, and market predictions for smarter investment decisions.'
    },
    {
        icon: <ChatIcon />,
        title: 'Voice & Chat Assistant',
        description: 'Chat or speak naturally to search for properties or get real-time guidance from our AI assistant.'
    },
    {
        icon: <SecureIcon />,
        title: 'Secure Listings System',
        description: 'Verified agents and landlords can post, manage, and update their listings within a secure dashboard.'
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m0-8v-2m8 4h2M2 12H4m14.364 5.636l1.414 1.414M4.222 4.222l1.414 1.414m14.142 0l-1.414 1.414M5.636 18.364l-1.414 1.414" /></svg>,
        title: 'Coming Soon',
        description: 'We are constantly innovating to bring you more powerful tools for your real estate journey.'
    }
];

const FeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 p-6 rounded-lg transition-all duration-300 hover:border-blue-500 hover:dark:bg-gray-800/50 hover:shadow-2xl hover:-translate-y-1">
        <div className="mb-4">{feature.icon}</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
    </div>
);

export const Features: React.FC = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 flex flex-col items-center pt-32">
            <div className="w-full max-w-5xl text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white animate-fade-in-up">
                    The Future of Real Estate is Here
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    MyGF AI transforms the property experience with a suite of intelligent tools designed for everyone from first-time renters to seasoned investors.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12 text-left animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </div>
            </div>
        </div>
    );
};
