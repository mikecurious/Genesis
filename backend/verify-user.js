require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: node verify-user.js user@example.com');
    process.exit(1);
}

console.log('🔍 Connecting to MongoDB...\n');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    const user = await User.findOne({ email }).select('+verificationToken');

    if (!user) {
        console.log('❌ User not found: ' + email);
        mongoose.connection.close();
        process.exit(1);
    }

    console.log('✅ User Found: ' + user.name);
    console.log('Email: ' + user.email);
    console.log('Current Status: ' + (user.isVerified ? 'Verified ✅' : 'Not Verified ❌'));

    if (user.isVerified) {
        console.log('\n⚠️  User is already verified!');
        mongoose.connection.close();
        process.exit(0);
    }

    // Manually verify the user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('\n✅ SUCCESS! User has been manually verified.');
    console.log('User can now log in without OTP verification.');

    mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
