
import React from 'react';

const announcements = [
    {
        id: 1,
        title: "New Feature: AI Voice for Client is Now Live!",
        date: "2024-08-15",
        content: "We're excited to announce that our premium AI Voice feature is now available. Activate it from your AI Settings tab to have our AI handle client calls and schedule viewings 24/7."
    },
    {
        id: 2,
        title: "Platform Update: Enhanced Marketing Tools",
        date: "2024-08-10",
        content: "We've rolled out an update to our 'Boost Property' feature, providing better visibility and more detailed analytics on your promoted listings. Check it out in the Marketing Tools tab."
    },
    {
        id: 3,
        title: "Welcome to the new MyGF AI Agent Dashboard",
        date: "2024-08-01",
        content: "Welcome, partners! We've launched our new, comprehensive dashboard designed to give you all the tools you need to succeed. Explore the new sections and let us know your feedback."
    }
];

export const AgentAnnouncements: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Announcements from Admin</h2>
            <div className="space-y-6">
                {announcements.map(announcement => (
                    <div key={announcement.id} className="p-4 bg-gray-50 dark:bg-gray-800/70 rounded-lg border-l-4 border-indigo-500">
                        <div className="flex justify-between items-baseline">
                           <h3 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                           <p className="text-xs text-gray-500">{announcement.date}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{announcement.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
