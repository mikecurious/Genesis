const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');

// This script reassigns all properties to a specific user
// Run this with: node backend/scripts/reassignProperties.js

const connectDB = require('../config/db');

const reassignProperties = async () => {
    try {
        await connectDB();

        console.log('Starting property reassignment...');

        // Get current user ID from command line argument or use the logged-in user
        const targetUserId = process.argv[2] || '691fb1644f02476001784a62'; // Current user from debug log

        console.log(`Target User ID: ${targetUserId}`);

        // Verify user exists
        const user = await User.findById(targetUserId);
        if (!user) {
            console.log('❌ User not found with that ID');
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.name} (${user.email}) - Role: ${user.role}`);

        // Get all properties
        const allProperties = await Property.find({});
        console.log(`Found ${allProperties.length} total properties`);

        // Update all properties to belong to this user
        const result = await Property.updateMany(
            {},
            { $set: { createdBy: targetUserId } }
        );

        console.log(`✅ Reassigned ${result.modifiedCount} properties to ${user.name}`);
        console.log('Property reassignment complete!');

        process.exit(0);
    } catch (error) {
        console.error('Error reassigning properties:', error);
        process.exit(1);
    }
};

reassignProperties();
