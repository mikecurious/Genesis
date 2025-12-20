import React from 'react';
import { type Listing } from '../../../types';
import { InsightsDisplay } from '../InsightsDisplay';

interface CombinedInsightsProps {
    listings: Listing[];
}

export const CombinedInsights: React.FC<CombinedInsightsProps> = ({ listings }) => {
    return <InsightsDisplay listings={listings} />;
};
