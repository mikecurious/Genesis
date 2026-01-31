require('dotenv').config();
const mongoose = require('mongoose');

async function debugPayment() {
    try {
        console.log('🔍 Debugging Live Payment Issue\n');

        // Connect to database
        console.log('1️⃣ Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database\n');

        // Import models
        const User = require('../models/User');
        const Payment = require('../models/Payment');

        // Find user with phone 0758930908 or 254758930908
        console.log('2️⃣ Looking for user with phone 0758930908 or 254758930908...');
        const user = await User.findOne({
            $or: [
                { phone: '0758930908' },
                { phone: '254758930908' },
                { phone: '+254758930908' }
            ]
        });

        if (user) {
            console.log('✅ Found user:', {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            });
        } else {
            console.log('❌ No user found with that phone number');
            console.log('   Checking all users...');
            const allUsers = await User.find({}).select('name email phone role').limit(5);
            console.log('   Sample users:', allUsers);
        }

        // Check recent payment attempts
        console.log('\n3️⃣ Checking recent payment attempts (last 10)...');
        const recentPayments = await Payment.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('user phoneNumber amount plan status resultDesc createdAt');

        console.log(`   Found ${recentPayments.length} recent payments:`);
        recentPayments.forEach((payment, index) => {
            console.log(`   ${index + 1}. Phone: ${payment.phoneNumber}, Amount: ${payment.amount}, Status: ${payment.status}, Plan: ${payment.plan || 'N/A'}, Date: ${payment.createdAt}`);
            if (payment.resultDesc) {
                console.log(`      Error: ${payment.resultDesc}`);
            }
        });

        // Test payment validation
        console.log('\n4️⃣ Testing Payment model validation...');
        const testPaymentData = {
            user: user ? user._id : new mongoose.Types.ObjectId(),
            phoneNumber: '254758930908',
            amount: 5000,
            plan: null,  // This should now be allowed
            paymentType: 'subscription',
            mpesaMode: 'paybill',
            status: 'pending'
        };

        try {
            const testPayment = new Payment(testPaymentData);
            await testPayment.validate();
            console.log('✅ Payment validation passed!');
            console.log('   Test payment data:', testPayment);
        } catch (validationError) {
            console.error('❌ Payment validation failed:', validationError.message);
        }

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    }
}

debugPayment();
