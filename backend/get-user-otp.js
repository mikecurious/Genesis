require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: node get-user-otp.js user@example.com');
    process.exit(1);
}

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

    console.log('\n✅ User Found: ' + user.name);
    console.log('Email: ' + user.email);
    console.log('Verified: ' + (user.isVerified ? 'Yes ✅' : 'No ❌'));

    if (user.isVerified) {
        console.log('\n✅ This user is already verified!');
    } else if (!user.verificationToken) {
        console.log('\n⚠️  No verification token found. User may need to register again.');
    } else {
        console.log('\n⚠️  OTP is hashed in database for security.');
        console.log('Hashed OTP: ' + user.verificationToken.substring(0, 30) + '...');
        console.log('\n💡 To get the OTP, check:');
        console.log('   1. Server console logs when user registered');
        console.log('   2. The registration API response');
        console.log('   3. Or generate a new OTP by having user re-register');
    }

    mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
