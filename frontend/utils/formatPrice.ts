/**
 * Currency symbols and formatting configuration
 */
const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; position: 'before' | 'after' }> = {
    'KSh': { symbol: 'KSh', locale: 'en-KE', position: 'after' },
    'USD': { symbol: '$', locale: 'en-US', position: 'before' },
    'EUR': { symbol: '€', locale: 'en-EU', position: 'before' },
    'GBP': { symbol: '£', locale: 'en-GB', position: 'before' },
};

/**
 * Format a numeric price with proper currency and comma separation
 * @param price - The numeric price
 * @param currency - Currency code (default: 'KSh')
 * @param includeDecimals - Whether to include decimal places (default: false)
 * @returns Formatted price string (e.g., "60,000 KSh" or "$60,000")
 */
export function formatPrice(
    price: number,
    currency: string = 'KSh',
    includeDecimals: boolean = false
): string {
    if (price === null || price === undefined || isNaN(price)) {
        return 'Price not available';
    }

    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG['KSh'];

    const formatted = includeDecimals
        ? price.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : price.toLocaleString(config.locale);

    return config.position === 'before'
        ? `${config.symbol}${formatted}`
        : `${formatted} ${config.symbol}`;
}

/**
 * Format price in shorthand notation (e.g., 1.5M, 500K)
 * @param price - The numeric price
 * @param currency - Currency code (default: 'KSh')
 * @returns Shorthand formatted price (e.g., "1.5M KSh" or "$1.5M")
 */
export function formatPriceShort(price: number, currency: string = 'KSh'): string {
    if (price === null || price === undefined || isNaN(price)) {
        return 'N/A';
    }

    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG['KSh'];
    let shortValue = '';

    if (price >= 1000000) {
        const millions = price / 1000000;
        shortValue = `${millions.toFixed(1)}M`;
    } else if (price >= 1000) {
        const thousands = price / 1000;
        shortValue = `${thousands.toFixed(0)}K`;
    } else {
        shortValue = price.toString();
    }

    return config.position === 'before'
        ? `${config.symbol}${shortValue}`
        : `${shortValue} ${config.symbol}`;
}
