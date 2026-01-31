/**
 * Script to reset/create surveyor account with proper password
 * Run: node backend/scripts/resetSurveyorPassword.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetSurveyor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mygf_ai_db');
        console.log('✓ Connected to MongoDB');

        // Delete existing surveyor if exists
        await User.deleteOne({ email: 'surveyor@test.com' });
        console.log('✓ Removed old surveyor account (if existed)');

        // Create new surveyor with password that will be hashed
        const surveyor = await User.create({
            name: 'Test Surveyor',
            email: 'surveyor@test.com',
            password: 'password123',
            phone: '+254712345678',
            role: 'Surveyor',
            isVerified: true, // Skip verification for test account
            subscription: {
                plan: 'None',
                status: 'active',
            },
        });

        console.log('\n✅ Surveyor account created/reset successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: surveyor@test.com');
        console.log('   Password: password123');
        console.log('\n🚀 Access at:');
        console.log('   http://localhost:3001');
        console.log('   Click "Portals" → "Surveyor Portal"\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetSurveyor();
