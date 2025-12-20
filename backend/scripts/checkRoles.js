const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Property = require('../models/Property');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkRoles = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();

        console.log('\n📊 USER ROLES SUMMARY\n');
        console.log('='.repeat(60));

        const users = await User.find({ role: { $exists: true } })
            .select('name email role phone createdAt')
            .sort('role');

        if (users.length === 0) {
            console.log('❌ No users with roles found in database');
            process.exit(1);
        }

        // Group users by role
        const roleGroups = {};
        users.forEach(user => {
            if (!roleGroups[user.role]) {
                roleGroups[user.role] = [];
            }
            roleGroups[user.role].push(user);
        });

        // Display users by role
        for (const [role, roleUsers] of Object.entries(roleGroups)) {
            console.log(`\n🔹 ${role.toUpperCase()} (${roleUsers.length})`);
            console.log('-'.repeat(60));
            roleUsers.forEach(user => {
                console.log(`   Name:  ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Phone: ${user.phone || 'N/A'}`);
                console.log(`   ID:    ${user._id}`);
                console.log('');
            });
        }

        console.log('='.repeat(60));
        console.log(`\n✅ Total users: ${users.length}`);
        console.log(`📋 Roles found: ${Object.keys(roleGroups).join(', ')}`);

        // Check properties by role
        console.log('\n\n📊 PROPERTIES BY ROLE\n');
        console.log('='.repeat(60));

        for (const [role, roleUsers] of Object.entries(roleGroups)) {
            const userIds = roleUsers.map(u => u._id);
            const properties = await Property.find({ createdBy: { $in: userIds } });

            if (properties.length > 0) {
                console.log(`\n🏠 ${role}: ${properties.length} properties`);
                properties.forEach(prop => {
                    console.log(`   - ${prop.title} (${prop.priceType})`);
                });
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Role verification complete!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking roles:', error);
        process.exit(1);
    }
};

checkRoles();
