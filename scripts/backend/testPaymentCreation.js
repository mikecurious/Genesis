const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Payment = require('../models/Payment');
const User = require('../models/User');

async function testPayment() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find an agent user
        const user = await User.findOne({ role: 'Agent' });
        if (!user) {
            console.log('❌ No agent user found');
            process.exit(1);
        }

        console.log(`\n👤 Using user: ${user.email} (${user._id})`);

        // Try creating a payment
        console.log('\n🔧 Attempting to create payment...');
        const payment = await Payment.create({
            user: user._id,
            phoneNumber: '254758930908',
            amount: 6000,
            paymentType: 'service',
            mpesaMode: 'paybill',
            status: 'pending',
            metadata: {
                propertyId: '694fb421353cfe3db19deabb',
                propertyTitle: 'Test Property - Nairobi CBD',
                action: 'boost_property'
            }
        });

        console.log('✅ Payment created successfully!');
        console.log('Payment ID:', payment._id);
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating payment:');
        console.error('Name:', error.name);
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        if (error.keyPattern) {
            console.error('Key Pattern:', error.keyPattern);
        }
        if (error.keyValue) {
            console.error('Key Value:', error.keyValue);
        }
        process.exit(1);
    }
}

testPayment();
