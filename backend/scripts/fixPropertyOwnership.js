const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');

// This script fixes properties that have undefined or null createdBy values
// Run this with: node backend/scripts/fixPropertyOwnership.js

const connectDB = require('../config/db');

const fixPropertyOwnership = async () => {
    try {
        await connectDB();

        console.log('Starting property ownership fix...');

        // Find all properties with undefined or null createdBy
        const brokenProperties = await Property.find({
            $or: [
                { createdBy: null },
                { createdBy: { $exists: false } }
            ]
        });

        console.log(`Found ${brokenProperties.length} properties with missing createdBy`);

        if (brokenProperties.length === 0) {
            console.log('No broken properties found. All properties have valid owners.');
            process.exit(0);
        }

        // Get the first admin or agent user to assign ownership
        const adminUser = await User.findOne({
            $or: [
                { role: 'Admin' },
                { role: 'Agent' }
            ]
        });

        if (!adminUser) {
            console.log('No admin or agent user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`Assigning properties to user: ${adminUser.name} (${adminUser.email})`);

        // Update all broken properties
        const result = await Property.updateMany(
            {
                $or: [
                    { createdBy: null },
                    { createdBy: { $exists: false } }
                ]
            },
            {
                $set: { createdBy: adminUser._id }
            }
        );

        console.log(`✅ Fixed ${result.modifiedCount} properties`);
        console.log('Property ownership fix complete!');

        process.exit(0);
    } catch (error) {
        console.error('Error fixing property ownership:', error);
        process.exit(1);
    }
};

fixPropertyOwnership();
