const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Payment = require('../models/Payment');

async function fixPaymentIndexes() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get all indexes on Payment collection
        const indexes = await Payment.collection.getIndexes();
        console.log('\n📋 Current Payment indexes:');
        console.log(JSON.stringify(indexes, null, 2));

        // Drop all indexes except _id
        console.log('\n🔧 Dropping all indexes except _id...');
        await Payment.collection.dropIndexes();
        console.log('✅ Indexes dropped');

        // Recreate indexes from schema
        console.log('\n🔧 Recreating indexes from schema...');
        await Payment.ensureIndexes();
        console.log('✅ Indexes recreated');

        // Show new indexes
        const newIndexes = await Payment.collection.getIndexes();
        console.log('\n📋 New Payment indexes:');
        console.log(JSON.stringify(newIndexes, null, 2));

        console.log('\n✅ Payment indexes fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing indexes:', error);
        process.exit(1);
    }
}

fixPaymentIndexes();
