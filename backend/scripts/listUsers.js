/**
 * List all users to find the correct email
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mygf_ai_db');
        console.log('✓ Connected to MongoDB\n');

        const users = await User.find({}).select('name email role subscription.plan');

        console.log(`Found ${users.length} users:\n`);
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email}`);
            console.log(`   Name: ${u.name}`);
            console.log(`   Role: ${u.role}`);
            console.log(`   Plan: ${u.subscription?.plan || 'None'}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

listUsers();
