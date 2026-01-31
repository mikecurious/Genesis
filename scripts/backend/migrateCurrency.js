/**
 * Migration Script: Add Currency Field and Ensure Numeric Prices
 *
 * This script:
 * 1. Sets currency to 'KSh' for all properties with null/missing currency
 * 2. Converts any remaining string prices to numbers
 *
 * Usage: node backend/scripts/migrateCurrency.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
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

// Define Property schema with flexible types
const PropertySchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    price: mongoose.Schema.Types.Mixed, // Accept both String and Number
    currency: String,
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
}, { strict: false }); // Allow flexible updates

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
        .replace(/KSh|Ksh|ksh|KES|kes|Kshs|kshs|\$|€|£/gi, '') // Remove currency
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
async function migrateCurrency() {
    try {
        console.log('🚀 Starting currency and price migration...\n');

        // Fetch all properties
        const properties = await Property.find({});
        console.log(`📊 Found ${properties.length} properties to process\n`);

        let currencyUpdatedCount = 0;
        let priceConvertedCount = 0;
        let failedCount = 0;
        const failedProperties = [];

        for (const property of properties) {
            const updates = {};
            let needsUpdate = false;

            // Check currency field
            if (!property.currency || property.currency === null) {
                updates.currency = 'KSh';
                needsUpdate = true;
                currencyUpdatedCount++;
                console.log(`💱 Setting currency: ${property._id} - Currency null → 'KSh'`);
            }

            // Check price type
            if (typeof property.price === 'string') {
                const numericPrice = parsePriceToNumber(property.price);

                if (numericPrice === null || numericPrice === 0) {
                    console.error(`❌ Failed: ${property._id} - Could not parse price: "${property.price}"`);
                    failedCount++;
                    failedProperties.push({
                        id: property._id,
                        title: property.title,
                        oldPrice: property.price,
                        currency: property.currency,
                        reason: 'Could not parse price'
                    });
                    continue;
                }

                updates.price = numericPrice;
                needsUpdate = true;
                priceConvertedCount++;
                console.log(`💰 Converting price: ${property._id} - "${property.price}" → ${numericPrice}`);
            }

            // Apply updates if needed
            if (needsUpdate) {
                try {
                    await Property.updateOne(
                        { _id: property._id },
                        { $set: updates }
                    );

                    console.log(`✅ Updated: ${property._id}`);
                    console.log(`   Title: ${property.title}`);
                    if (updates.price) console.log(`   Price: ${updates.price}`);
                    if (updates.currency) console.log(`   Currency: ${updates.currency}`);
                } catch (updateError) {
                    console.error(`❌ Update Failed: ${property._id} - ${updateError.message}`);
                    failedCount++;
                    failedProperties.push({
                        id: property._id,
                        title: property.title,
                        updates: updates,
                        reason: updateError.message
                    });
                }
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`💱 Currency fields updated: ${currencyUpdatedCount}`);
        console.log(`💰 Prices converted to numbers: ${priceConvertedCount}`);
        console.log(`❌ Failed: ${failedCount}`);
        console.log(`📝 Total processed: ${properties.length}`);
        console.log('='.repeat(60));

        if (failedProperties.length > 0) {
            console.log('\n❌ FAILED PROPERTIES:');
            console.table(failedProperties);
            console.log('\n⚠️  Please review and manually fix failed properties');
        }

        if (currencyUpdatedCount > 0 || priceConvertedCount > 0) {
            console.log('\n✅ Migration completed successfully!');
            console.log('\n📋 All properties now have:');
            console.log('   • Numeric prices for calculations');
            console.log('   • Currency field set (KSh default)');
            console.log('   • Ready for multi-currency support');
        } else {
            console.log('\n✅ No updates needed - all properties already migrated!');
        }

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
}

// Run migration
connectDB().then(async () => {
    try {
        await migrateCurrency();
        console.log('\n✅ Migration script completed');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration script failed:', error);
        process.exit(1);
    }
});
