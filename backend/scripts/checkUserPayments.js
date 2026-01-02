const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Payment = require('../models/Payment');

async function checkPayments() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const phoneNumber = '254758930908';
        const payments = await Payment.find({ phoneNumber })
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`📋 Recent payments for ${phoneNumber}:\n`);
        if (payments.length === 0) {
            console.log('  No payments found for this phone number');
        } else {
            payments.forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.createdAt.toISOString()}`);
                console.log(`     Status: ${p.status}`);
                console.log(`     Amount: KES ${p.amount}`);
                console.log(`     Type: ${p.paymentType}`);
                console.log(`     Metadata: ${JSON.stringify(p.metadata)}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPayments();
