/**
 * Database Index Setup Script
 * Ensures all required indexes exist for optimal performance
 * Run with: node scripts/setupIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

async function setupIndexes() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Setting up database indexes...\n');

        // User indexes
        console.log('Setting up User indexes...');
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });
        await User.collection.createIndex({ createdAt: -1 });
        console.log('✅ User indexes created');

        // Property indexes
        console.log('Setting up Property indexes...');
        await Property.collection.createIndex({ owner: 1 });
        await Property.collection.createIndex({ location: 1 });
        await Property.collection.createIndex({ type: 1 });
        await Property.collection.createIndex({ status: 1 });
        await Property.collection.createIndex({ price: 1 });
        await Property.collection.createIndex({ createdAt: -1 });
        // Compound index for common queries
        await Property.collection.createIndex({ location: 1, type: 1, status: 1 });
        await Property.collection.createIndex({ owner: 1, status: 1 });
        console.log('✅ Property indexes created');

        // Lead indexes
        console.log('Setting up Lead indexes...');
        await Lead.collection.createIndex({ property: 1 });
        await Lead.collection.createIndex({ 'client.email': 1 });
        await Lead.collection.createIndex({ status: 1 });
        await Lead.collection.createIndex({ createdAt: -1 });
        await Lead.collection.createIndex({ property: 1, createdAt: -1 });
        console.log('✅ Lead indexes created');

        // Notification indexes
        console.log('Setting up Notification indexes...');
        await Notification.collection.createIndex({ user: 1 });
        await Notification.collection.createIndex({ read: 1 });
        await Notification.collection.createIndex({ createdAt: -1 });
        await Notification.collection.createIndex({ user: 1, read: 1, createdAt: -1 });
        console.log('✅ Notification indexes created');

        // Payment indexes
        console.log('Setting up Payment indexes...');
        await Payment.collection.createIndex({ user: 1 });
        await Payment.collection.createIndex({ status: 1 });
        await Payment.collection.createIndex({ createdAt: -1 });
        await Payment.collection.createIndex({ user: 1, status: 1 });
        console.log('✅ Payment indexes created');

        console.log('\n📋 Verifying all indexes...\n');

        // List all indexes
        const userIndexes = await User.collection.getIndexes();
        const propertyIndexes = await Property.collection.getIndexes();
        const leadIndexes = await Lead.collection.getIndexes();
        const notificationIndexes = await Notification.collection.getIndexes();
        const paymentIndexes = await Payment.collection.getIndexes();

        console.log('User indexes:', Object.keys(userIndexes).length);
        console.log('Property indexes:', Object.keys(propertyIndexes).length);
        console.log('Lead indexes:', Object.keys(leadIndexes).length);
        console.log('Notification indexes:', Object.keys(notificationIndexes).length);
        console.log('Payment indexes:', Object.keys(paymentIndexes).length);

        console.log('\n✅ All database indexes created successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up indexes:', error);
        process.exit(1);
    }
}

setupIndexes();
