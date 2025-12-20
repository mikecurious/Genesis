/**
 * Fix specific surveyor account role
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const fixSpecificSurveyor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mygf_ai_db');
        console.log('✓ Connected to MongoDB\n');

        const email = 'johnsir@gmail.com';

        // Find and update the user
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found:', email);
            process.exit(1);
        }

        console.log('📋 Before update:');
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   Plan:', user.subscription?.plan);

        // Update role to Surveyor
        user.role = 'Surveyor';
        await user.save();

        console.log('\n✅ Updated to:');
        console.log('   Role:', user.role);

        console.log('\n✨ Done! Please logout and login again to see the Surveyor Dashboard');
        console.log('   The dashboard will show: Tasks, Map View, My Reports tabs\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixSpecificSurveyor();
