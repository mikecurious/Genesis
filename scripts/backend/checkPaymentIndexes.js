const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkIndexes() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const indexes = await db.collection('payments').indexes();

        console.log('\n📋 Detailed Payment Indexes:\n');
        indexes.forEach((index, i) => {
            console.log(`Index ${i + 1}: ${index.name}`);
            console.log('  Keys:', JSON.stringify(index.key, null, 2));
            console.log('  Unique:', index.unique || false);
            console.log('  Sparse:', index.sparse || false);
            console.log('  Background:', index.background || false);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkIndexes();
