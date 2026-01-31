const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    subscription: {
        plan: String,
        status: String,
        expiresAt: Date,
    },
    isVerified: Boolean,
    createdAt: Date,
});

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: 'test@agent.com' });
        if (existingUser) {
            console.log('❌ Test user already exists!');
            console.log('Email: test@agent.com');
            console.log('Password: password123');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create test user
        const testUser = new User({
            name: 'Test Agent',
            email: 'test@agent.com',
            password: hashedPassword,
            phone: '+254712345678',
            role: 'Agent',
            subscription: {
                plan: 'MyGF 1.3',
                status: 'active',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
            isVerified: true,
            createdAt: new Date(),
        });

        await testUser.save();

        console.log('✅ Test user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: test@agent.com');
        console.log('🔑 Password: password123');
        console.log('👤 Role: Agent');
        console.log('📦 Plan: MyGF 1.3 (Active)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('You can now log in with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        process.exit(1);
    }
}

createTestUser();
