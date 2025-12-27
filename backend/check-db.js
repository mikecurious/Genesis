require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

console.log('🔍 Connecting to MongoDB...\n');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Connected to MongoDB Atlas\n');
    console.log('Database:', mongoose.connection.name);
    console.log('---\n');

    // Get all users
    const users = await User.find({}).select('+password +verificationToken').sort({ createdAt: -1 }).limit(10);

    const totalUsers = await User.countDocuments();
    console.log(`📊 Total Users: ${totalUsers}\n`);
    console.log('Recent Users (Last 10):\n');

    users.forEach((user, index) => {
        console.log(`${index + 1}. User: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Role: ${user.role || 'Not set'}`);
        console.log(`   Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Account Status: ${user.accountStatus || 'active'}`);

        if (!user.isVerified && user.verificationToken) {
            console.log(`   🔑 OTP (Hashed): ${user.verificationToken.substring(0, 20)}...`);
            console.log(`   ⏰ OTP Expires: ${user.verificationTokenExpires || 'N/A'}`);
        }

        if (user.subscription) {
            console.log(`   📦 Plan: ${user.subscription.plan || 'None'}`);
            console.log(`   Status: ${user.subscription.status || 'inactive'}`);
        }

        console.log(`   Created: ${user.createdAt}`);
        console.log('');
    });

    // Show unverified users
    const unverified = await User.find({ isVerified: false }).select('+verificationToken');
    if (unverified.length > 0) {
        console.log(`\n⚠️  Unverified Users: ${unverified.length}\n`);
        unverified.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Registered: ${user.createdAt}`);
            if (user.verificationTokenExpires) {
                const expired = new Date() > user.verificationTokenExpires;
                console.log(`   OTP Status: ${expired ? '❌ Expired' : '✅ Valid'}`);
                console.log(`   Expires: ${user.verificationTokenExpires}`);
            }
            console.log('');
        });
    }

    // Collections info
    console.log('\n📁 Database Collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
        console.log(`   - ${col.name}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
})
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
});
