const kenyaLocations = require('../data/kenya-locations.json');

/**
 * Location Matcher Service
 * Provides fuzzy matching for Kenya locations to handle vague queries
 */
class LocationMatcherService {
    constructor() {
        this.locations = this.buildLocationIndex();
    }

    /**
     * Build a searchable index of all locations
     */
    buildLocationIndex() {
        const index = [];

        kenyaLocations.counties.forEach(county => {
            // Add county itself
            index.push({
                name: county.name,
                type: 'county',
                region: county.region,
                searchTerms: [
                    county.name.toLowerCase(),
                    ...county.aliases.map(a => a.toLowerCase())
                ]
            });

            // Add neighborhoods (mainly Nairobi)
            if (county.neighborhoods) {
                county.neighborhoods.forEach(neighborhood => {
                    index.push({
                        name: neighborhood,
                        type: 'neighborhood',
                        county: county.name,
                        region: county.region,
                        searchTerms: [neighborhood.toLowerCase()]
                    });
                });
            }

            // Add towns
            if (county.towns) {
                county.towns.forEach(town => {
                    index.push({
                        name: town,
                        type: 'town',
                        county: county.name,
                        region: county.region,
                        searchTerms: [town.toLowerCase()]
                    });
                });
            }
        });

        return index;
    }

    /**
     * Calculate Levenshtein distance for fuzzy matching
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Calculate similarity score (0-1, higher is better)
     */
    similarityScore(str1, str2) {
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 1.0;

        const distance = this.levenshteinDistance(str1, str2);
        return 1.0 - (distance / maxLen);
    }

    /**
     * Check if query contains location as a substring
     */
    containsMatch(query, location) {
        const queryLower = query.toLowerCase();
        return location.searchTerms.some(term => {
            // Exact match
            if (queryLower.includes(term)) {
                return true;
            }

            // Word boundary match
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            if (regex.test(queryLower)) {
                return true;
            }

            return false;
        });
    }

    /**
     * Match query against location database
     * Returns array of matches sorted by relevance
     */
    matchLocation(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }

        const queryLower = query.toLowerCase().trim();
        const matches = [];

        // First pass: exact and substring matches
        for (const location of this.locations) {
            if (this.containsMatch(queryLower, location)) {
                matches.push({
                    ...location,
                    score: 1.0, // Perfect match
                    matchType: 'exact'
                });
            }
        }

        // If we found exact matches, return them
        if (matches.length > 0) {
            return matches.sort((a, b) => {
                // Prioritize by type: neighborhood > town > county
                const typeOrder = { 'neighborhood': 0, 'town': 1, 'county': 2 };
                return typeOrder[a.type] - typeOrder[b.type];
            });
        }

        // Second pass: fuzzy matching
        const words = queryLower.split(/\s+/);

        for (const location of this.locations) {
            let bestScore = 0;

            // Try matching against each word in the query
            for (const word of words) {
                if (word.length < 3) continue; // Skip short words

                for (const term of location.searchTerms) {
                    const score = this.similarityScore(word, term);

                    if (score > bestScore) {
                        bestScore = score;
                    }
                }
            }

            // Include if similarity is above threshold (70%)
            if (bestScore >= 0.7) {
                matches.push({
                    ...location,
                    score: bestScore,
                    matchType: 'fuzzy'
                });
            }
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score).slice(0, 5);
    }

    /**
     * Expand regional query to specific locations
     * e.g., "coast" -> ["Mombasa", "Kilifi", "Kwale", ...]
     */
    expandRegionalQuery(query) {
        const queryLower = query.toLowerCase().trim();
        const commonTerms = kenyaLocations.common_search_terms;

        for (const [region, locations] of Object.entries(commonTerms)) {
            if (queryLower.includes(region)) {
                return locations;
            }
        }

        return null;
    }

    /**
     * Get best location match from query
     * Returns the most likely location name or null
     */
    getBestMatch(query) {
        // Check for regional expansion first
        const regionalLocations = this.expandRegionalQuery(query);
        if (regionalLocations) {
            return regionalLocations[0]; // Return first location in region
        }

        const matches = this.matchLocation(query);

        if (matches.length === 0) {
            return null;
        }

        // Return the best match
        return matches[0].name;
    }

    /**
     * Get all possible location matches
     * Useful for showing suggestions to users
     */
    getAllMatches(query) {
        const regionalLocations = this.expandRegionalQuery(query);
        if (regionalLocations) {
            return regionalLocations.map(name => ({ name, type: 'regional_expansion' }));
        }

        return this.matchLocation(query);
    }

    /**
     * Check if query contains any location reference
     */
    hasLocationReference(query) {
        return this.getBestMatch(query) !== null;
    }
}

// Export singleton instance
module.exports = new LocationMatcherService();
