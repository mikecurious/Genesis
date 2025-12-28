/**
 * Format a numeric price to Kenyan Shillings string
 * @param price - The numeric price
 * @param includeDecimals - Whether to include decimal places (default: false)
 * @returns Formatted price string (e.g., "60,000 KSh")
 */
export function formatPrice(price: number, includeDecimals: boolean = false): string {
    if (price === null || price === undefined || isNaN(price)) {
        return 'Price not available';
    }

    const formatted = includeDecimals
        ? price.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : price.toLocaleString('en-KE');

    return `${formatted} KSh`;
}

/**
 * Format price in shorthand notation (e.g., 1.5M, 500K)
 * @param price - The numeric price
 * @returns Shorthand formatted price (e.g., "1.5M KSh")
 */
export function formatPriceShort(price: number): string {
    if (price === null || price === undefined || isNaN(price)) {
        return 'N/A';
    }

    if (price >= 1000000) {
        const millions = price / 1000000;
        return `${millions.toFixed(1)}M KSh`;
    } else if (price >= 1000) {
        const thousands = price / 1000;
        return `${thousands.toFixed(0)}K KSh`;
    }

    return `${price} KSh`;
}
