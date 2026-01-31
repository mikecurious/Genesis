const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Payment = require('../models/Payment');

async function cleanPendingPayments() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Find and delete old pending/failed payments (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const result = await Payment.deleteMany({
            status: { $in: ['pending', 'failed'] },
            createdAt: { $lt: oneHourAgo }
        });

        console.log(`🧹 Deleted ${result.deletedCount} old pending/failed payments`);

        // Also clean up very recent pending payments for the test phone number
        const testResult = await Payment.deleteMany({
            phoneNumber: '254758930908',
            status: 'pending'
        });

        console.log(`🧹 Deleted ${testResult.deletedCount} test pending payments for 254758930908`);
        console.log('\n✅ Cleanup complete!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanPendingPayments();
