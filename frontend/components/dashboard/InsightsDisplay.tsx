import React, { useState } from 'react';
import { type Listing } from '../../types';
import { generateDashboardInsights } from '../../services/geminiService';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface InsightsDisplayProps {
    listings: Listing[];
}

export const InsightsDisplay: React.FC<InsightsDisplayProps> = ({ listings }) => {
    const [insights, setInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setInsights(null);
        try {
            const result = await generateDashboardInsights(listings);
            setInsights(result);
        } catch (error) {
            console.error(error);
            setInsights("<p>Failed to generate insights. Please try again.</p>");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-wait flex items-center justify-center min-w-[180px]"
                >
                    {isLoading ? <SpinnerIcon /> : 'Generate Insights'}
                </button>
            </div>
            
            <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[200px]">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <p>Generating your report...</p>
                    </div>
                )}
                {insights ? (
                    <div dangerouslySetInnerHTML={{ __html: insights }} />
                ) : (
                    !isLoading && (
                         <div className="text-center py-8 text-gray-500">
                            <p>Click "Generate Insights" to get an AI-powered analysis of your current listings.</p>
                         </div>
                    )
                )}
            </div>
        </div>
    );
};
