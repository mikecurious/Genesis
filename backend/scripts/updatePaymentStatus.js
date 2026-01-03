const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Payment = require('../models/Payment');

async function updatePayment() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const checkoutRequestID = 'ws_CO_02012026212905999758930908';

        // Find the payment
        const payment = await Payment.findOne({ checkoutRequestID });

        if (!payment) {
            console.log('❌ Payment not found');
            process.exit(1);
        }

        console.log('📋 Current payment status:');
        console.log(`   Status: ${payment.status}`);
        console.log(`   Amount: ${payment.amount} KSh`);
        console.log(`   Phone: ${payment.phoneNumber}`);
        console.log(`   Created: ${payment.createdAt}`);
        console.log('');

        // Update to completed
        payment.status = 'completed';
        payment.resultCode = '0';
        payment.resultDesc = 'The service request is processed successfully.';
        payment.mpesaReceiptNumber = 'SANDBOX_RECEIPT_' + Date.now();

        await payment.save();

        console.log('✅ Payment updated to completed!');
        console.log(`   New status: ${payment.status}`);
        console.log(`   Result: ${payment.resultDesc}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updatePayment();
