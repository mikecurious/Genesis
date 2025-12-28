/**
 * Migration Script: Convert Property Price from String to Number
 *
 * This script converts all property prices from String format (e.g., "60,000 KSh")
 * to Number format (e.g., 60000) for proper mathematical operations.
 *
 * IMPORTANT: Run this BEFORE updating the Property schema
 *
 * Usage: node backend/scripts/migratePriceToNumber.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected for migration');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Define Property schema with OLD String type (before migration)
const PropertySchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    price: String, // OLD: String type
    priceType: String,
    imageUrls: [String],
    tags: [String],
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    status: String,
    moderationStatus: String,
    moderatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    moderatedAt: Date,
    moderationNote: String,
    boosted: Boolean,
    views: Number,
    embedding: [Number],
    semanticTags: [String],
    bedrooms: Number,
    bathrooms: Number,
    propertyType: String,
    amenities: [String],
    squareFeet: Number,
    yearBuilt: Number,
    createdAt: Date,
}, { strict: false }); // Allow flexible updates during migration

const Property = mongoose.model('Property', PropertySchema);

/**
 * Parse price string to number
 * Handles formats: "60,000 KSh", "KSh 5,000,000", "20000", "2.5M", etc.
 */
function parsePriceToNumber(priceString) {
    if (!priceString || typeof priceString !== 'string') {
        return null;
    }

    // Remove common currency symbols and text
    let cleaned = priceString
        .replace(/KSh|Ksh|ksh|KES|kes|Kshs|kshs/gi, '') // Remove currency
        .replace(/,/g, '') // Remove commas
        .replace(/\s+/g, '') // Remove spaces
        .trim();

    // Handle shorthand notation (e.g., "2.5M", "500K")
    if (cleaned.match(/^[\d.]+[MmKk]$/)) {
        const value = parseFloat(cleaned.slice(0, -1));
        const unit = cleaned.slice(-1).toUpperCase();

        if (unit === 'M') {
            return value * 1000000;
        } else if (unit === 'K') {
            return value * 1000;
        }
    }

    // Parse as regular number
    const parsed = parseFloat(cleaned);

    // Validate result
    if (isNaN(parsed) || parsed < 0) {
        return null;
    }

    // Round to nearest integer (no decimal prices)
    return Math.round(parsed);
}

/**
 * Main migration function
 */
async function migratePrice() {
    try {
        console.log('🚀 Starting price migration...\n');

        // Fetch all properties
        const properties = await Property.find({});
        console.log(`📊 Found ${properties.length} properties to migrate\n`);

        let successCount = 0;
        let failedCount = 0;
        let skippedCount = 0;
        const failedProperties = [];

        for (const property of properties) {
            const oldPrice = property.price;

            // Check if already a number (already migrated)
            if (typeof oldPrice === 'number') {
                console.log(`⏭️  Skipped: ${property._id} - Already migrated (price is number: ${oldPrice})`);
                skippedCount++;
                continue;
            }

            // Parse price
            const newPrice = parsePriceToNumber(oldPrice);

            if (newPrice === null || newPrice === 0) {
                console.error(`❌ Failed: ${property._id} - Could not parse price: "${oldPrice}"`);
                failedCount++;
                failedProperties.push({
                    id: property._id,
                    title: property.title,
                    oldPrice: oldPrice,
                    reason: 'Could not parse price'
                });
                continue;
            }

            // Validate price is reasonable (between 1,000 and 10 billion KSh)
            if (newPrice < 1000 || newPrice > 10000000000) {
                console.warn(`⚠️  Warning: ${property._id} - Suspicious price: ${newPrice} (from "${oldPrice}")`);
                console.warn(`   Title: ${property.title}`);
                console.warn(`   Proceeding anyway...`);
            }

            // Update property using updateOne to bypass validation
            try {
                await Property.updateOne(
                    { _id: property._id },
                    { $set: { price: newPrice } }
                );

                console.log(`✅ Success: ${property._id}`);
                console.log(`   Title: ${property.title}`);
                console.log(`   Old: "${oldPrice}" → New: ${newPrice}`);
                successCount++;
            } catch (updateError) {
                console.error(`❌ Update Failed: ${property._id} - ${updateError.message}`);
                failedCount++;
                failedProperties.push({
                    id: property._id,
                    title: property.title,
                    oldPrice: oldPrice,
                    newPrice: newPrice,
                    reason: updateError.message
                });
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successfully migrated: ${successCount}`);
        console.log(`⏭️  Already migrated (skipped): ${skippedCount}`);
        console.log(`❌ Failed: ${failedCount}`);
        console.log(`📝 Total processed: ${properties.length}`);
        console.log('='.repeat(60));

        if (failedProperties.length > 0) {
            console.log('\n❌ FAILED PROPERTIES:');
            console.table(failedProperties);
            console.log('\n⚠️  Please review and manually fix failed properties');
        }

        if (successCount > 0) {
            console.log('\n✅ Migration completed successfully!');
            console.log('\n📋 NEXT STEPS:');
            console.log('   1. Review the migration results above');
            console.log('   2. Update backend/models/Property.js: Change price type from String to Number');
            console.log('   3. Update frontend/types.ts: Change price from string to number');
            console.log('   4. Re-enable averagePrice calculation in analytics.js');
            console.log('   5. Remove price parsing workarounds in frontend components');
        }

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
}

// Run migration
connectDB().then(async () => {
    try {
        await migratePrice();
        console.log('\n✅ Migration script completed');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration script failed:', error);
        process.exit(1);
    }
});
