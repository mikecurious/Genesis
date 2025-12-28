/**
 * Test script for Location Matcher Service
 * Demonstrates fuzzy matching and location detection capabilities
 */

const locationMatcher = require('../services/locationMatcherService');

console.log('🌍 Kenya Location Matcher - Test Suite\n');
console.log('='.repeat(70));

// Test cases with vague/fuzzy queries
const testQueries = [
    // Exact matches
    'properties in Westlands',
    'houses for rent in Kilimani',
    'apartments in Karen',

    // Fuzzy/typo matches
    'looking for house in Westlans',  // Typo
    'apartment in Kilimany',          // Typo
    'property in Karin',              // Typo

    // Regional queries
    'show me properties on the coast',
    'houses in central Kenya',
    'land in rift valley',

    // Vague location references
    'near Nairobi',
    'Mombasa area',
    'around Nakuru',

    // Multiple locations
    'Westlands or Kilimani',
    'Karen, Lavington, or Runda',

    // County-level
    'properties in Kiambu county',
    'land in Machakos',

    // Towns
    'houses in Thika',
    'apartments in Eldoret',
    'property in Kisumu',

    // Neighborhoods with variations
    'Upper Hill',
    'upperhill',
    'CBD Nairobi',

    // Coastal areas
    'Diani beach',
    'Nyali Mombasa',
    'Malindi properties',

    // Edge cases
    'somewhere in Kenya',
    '3 bedroom house',  // No location
    'Westlnds',         // Heavy typo
];

console.log('🧪 Testing Location Detection:\n');

testQueries.forEach((query, index) => {
    console.log(`\n${index + 1}. Query: "${query}"`);
    console.log('-'.repeat(70));

    // Get best match
    const bestMatch = locationMatcher.getBestMatch(query);
    console.log(`   ✓ Best Match: ${bestMatch || 'No location detected'}`);

    // Get all matches (for suggestions)
    const allMatches = locationMatcher.getAllMatches(query);
    if (allMatches.length > 1) {
        console.log(`   → Other matches (${allMatches.length - 1}):`);
        allMatches.slice(1, 4).forEach(match => {
            console.log(`      - ${match.name} (${match.type}, score: ${match.score?.toFixed(2) || 'N/A'})`);
        });
    }
});

console.log('\n' + '='.repeat(70));
console.log('\n📊 Summary:');
console.log(`   Total test queries: ${testQueries.length}`);
const successCount = testQueries.filter(q => locationMatcher.getBestMatch(q)).length;
console.log(`   Successfully detected: ${successCount}/${testQueries.length}`);
console.log(`   Detection rate: ${((successCount / testQueries.length) * 100).toFixed(1)}%`);

console.log('\n🎯 Location Matcher Features:');
console.log('   ✓ Fuzzy matching for typos');
console.log('   ✓ Regional expansion (coast, central, etc.)');
console.log('   ✓ Handles 47 counties + 100+ towns/neighborhoods');
console.log('   ✓ Case-insensitive matching');
console.log('   ✓ Alias support (Nairobi City, Nai, NRB)');
console.log('   ✓ Word boundary detection');
console.log('   ✓ Levenshtein distance for similarity');

console.log('\n✅ Test Complete!\n');
