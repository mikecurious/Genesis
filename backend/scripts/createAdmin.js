require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to database\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin account already exists:');
            console.log('   Email:', existingAdmin.email);
            console.log('   Name:', existingAdmin.name);
            
            const overwrite = await question('\nDo you want to create another admin? (yes/no): ');
            if (overwrite.toLowerCase() !== 'yes') {
                console.log('❌ Admin creation cancelled');
                await mongoose.connection.close();
                rl.close();
                process.exit(0);
            }
        }

        console.log('📝 Creating Admin Account\n');
        
        const name = await question('Enter admin name: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password (min 6 characters): ');
        const phone = await question('Enter admin phone (optional): ');

        if (!name || !email || !password) {
            console.error('❌ Name, email, and password are required');
            await mongoose.connection.close();
            rl.close();
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters');
            await mongoose.connection.close();
            rl.close();
            process.exit(1);
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('❌ User with this email already exists');
            await mongoose.connection.close();
            rl.close();
            process.exit(1);
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password,
            phone: phone || '',
            role: 'Admin',
            isVerified: true, // Auto-verify admin
            subscription: {
                plan: 'MyGF 3.2', // Highest tier
                status: 'active',
            }
        });

        console.log('\n✅ Admin account created successfully!');
        console.log('-----------------------------------');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('ID:', admin._id);
        console.log('-----------------------------------');
        console.log('\n🔐 You can now login with these credentials');

        await mongoose.connection.close();
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        await mongoose.connection.close();
        rl.close();
        process.exit(1);
    }
};

createAdminUser();
