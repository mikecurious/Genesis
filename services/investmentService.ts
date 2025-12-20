import { Listing } from '../types';

export interface InvestmentAnalysis {
    roi: number; // Return on Investment %
    capRate: number; // Capitalization Rate %
    monthlyCashFlow: number;
    investmentScore: number; // 0-100
    marketSentiment: 'Bullish' | 'Bearish' | 'Neutral';
    priceAssessment: 'Undervalued' | 'Fair Market' | 'Overpriced';
    projectedAppreciation: number; // % per year
}

/**
 * Calculates investment metrics for a property
 * @param price Listing price
 * @param estimatedRent Monthly rental income (estimated)
 */
export const analyzeInvestment = (price: number, estimatedRent: number): InvestmentAnalysis => {
    // Basic assumptions (can be made dynamic later)
    const annualRent = estimatedRent * 12;
    const operatingExpenses = annualRent * 0.20; // 20% for maintenance, vacancy, management
    const netOperatingIncome = annualRent - operatingExpenses;

    const capRate = (netOperatingIncome / price) * 100;

    // ROI Calculation (assuming 20% down payment cash-on-cash)
    const downPayment = price * 0.20;
    const loanAmount = price * 0.80;
    const interestRate = 0.13; // 13% typical mortgage in Kenya
    const annualMortgage = loanAmount * interestRate; // Simplified interest-only for estimation
    const annualCashFlow = netOperatingIncome - annualMortgage;
    const roi = (annualCashFlow / downPayment) * 100;

    // Investment Score (Weighted algorithm)
    // Cap Rate (40%), ROI (40%), Price Point (20%)
    let score = 0;
    if (capRate > 8) score += 40;
    else if (capRate > 6) score += 30;
    else score += 15;

    if (roi > 15) score += 40;
    else if (roi > 10) score += 30;
    else score += 10;

    if (price < 15000000) score += 20; // Affordable entry point bonus
    else score += 10;

    // Market Sentiment (Mock logic based on price trends)
    const marketSentiment = price > 20000000 ? 'Neutral' : 'Bullish'; // Lower priced moves faster

    // Price Assessment
    let priceAssessment: 'Undervalued' | 'Fair Market' | 'Overpriced' = 'Fair Market';
    if (score > 80) priceAssessment = 'Undervalued';
    if (score < 40) priceAssessment = 'Overpriced';

    return {
        roi: parseFloat(roi.toFixed(2)),
        capRate: parseFloat(capRate.toFixed(2)),
        monthlyCashFlow: parseFloat((annualCashFlow / 12).toFixed(0)),
        investmentScore: score,
        marketSentiment,
        priceAssessment,
        projectedAppreciation: 5.5 // Average annual appreciation
    };
};

/**
 * Generates a quick "AI Insight" string for UI badges
 */
export const getInvestmentBadge = (analysis: InvestmentAnalysis): string | null => {
    if (analysis.investmentScore >= 85) return "💎 Rare Gem";
    if (analysis.roi > 20) return "🚀 High Yield";
    if (analysis.priceAssessment === 'Undervalued') return "💰 Undervalued";
    if (analysis.projectedAppreciation > 7) return "📈 High Growth";
    return null;
};
