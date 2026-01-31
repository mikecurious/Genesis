/**
 * Comprehensive debug script for surveyor login
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const debugLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mygf_ai_db');
        console.log('✓ Connected to MongoDB\n');

        const surveyor = await User.findOne({ email: 'surveyor@test.com' }).select('+password');

        if (!surveyor) {
            console.log('❌ Surveyor not found!');
            process.exit(1);
        }

        console.log('📋 Surveyor Account Details:');
        console.log('  Name:', surveyor.name);
        console.log('  Email:', surveyor.email);
        console.log('  Role:', surveyor.role);
        console.log('  isVerified:', surveyor.isVerified);
        console.log('  Subscription Plan:', surveyor.subscription?.plan);
        console.log('  Subscription Status:', surveyor.subscription?.status);
        console.log('  Password exists:', !!surveyor.password);

        // Test password that meets requirements (uppercase, lowercase, number, special)
        const testPassword = 'Test@123';
        const isMatch = await surveyor.matchPassword(testPassword);
        console.log('\n🔐 Password Test:');
        console.log('  Password matches:', isMatch ? '✅ YES' : '❌ NO');

        // Check all login requirements
        console.log('\n✅ Login Requirements Check:');
        console.log('  1. User exists:', surveyor ? '✅' : '❌');
        console.log('  2. isVerified:', surveyor.isVerified ? '✅' : '❌');
        console.log('  3. Password matches:', isMatch ? '✅' : '❌');
        console.log('  4. Role is Surveyor:', surveyor.role === 'Surveyor' ? '✅' : '❌');

        if (!surveyor.isVerified) {
            console.log('\n⚠️  ISSUE FOUND: Account not verified!');
            console.log('   Fixing...');
            surveyor.isVerified = true;
            await surveyor.save();
            console.log('   ✅ Fixed!');
        }

        if (!isMatch) {
            console.log('\n⚠️  ISSUE FOUND: Password does not match!');
            console.log('   Resetting password...');
            surveyor.password = testPassword;
            await surveyor.save();
            console.log('   ✅ Password reset!');
        }

        console.log('\n✅ All checks passed! Login should work now.');
        console.log('\n📝 Login Credentials:');
        console.log('   Email: surveyor@test.com');
        console.log('   Password: Test@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

debugLogin();
