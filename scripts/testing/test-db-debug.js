const mongoose = require('mongoose');
require('dotenv').config();

// Set mongoose to show debug info
mongoose.set('debug', true);

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('URI (sanitized):', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB connection successful!');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        
        await mongoose.disconnect();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('Error:', error.message);
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        process.exit(1);
    }
}

testConnection();