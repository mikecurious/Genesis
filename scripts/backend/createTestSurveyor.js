/**
 * One-time script to create a test surveyor account
 * Run this with: node backend/scripts/createTestSurveyor.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestSurveyor = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mygf_ai_db');
        console.log('✓ Connected to MongoDB');

        // Check if surveyor already exists
        const existingSurveyor = await User.findOne({ email: 'surveyor@test.com' });
        if (existingSurveyor) {
            console.log('⚠ Test surveyor already exists!');
            console.log('Email: surveyor@test.com');
            console.log('You can login with password: password123');
            process.exit(0);
        }

        // Create test surveyor
        const surveyor = await User.create({
            name: 'Test Surveyor',
            email: 'surveyor@test.com',
            password: 'password123', // Will be hashed automatically by User model
            phone: '+254712345678',
            role: 'Surveyor',
            subscription: {
                plan: 'None',
                status: 'active',
            },
        });

        console.log('\n✓ Test surveyor account created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: surveyor@test.com');
        console.log('   Password: password123');
        console.log('\n🚀 How to access:');
        console.log('   1. Go to http://localhost:5173');
        console.log('   2. Click "Portals" in the navbar');
        console.log('   3. Select "Surveyor Portal"');
        console.log('   4. Login with the credentials above');
        console.log('\n✨ You can now test the surveyor dashboard!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test surveyor:', error.message);
        process.exit(1);
    }
};

createTestSurveyor();
