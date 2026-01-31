const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('URI:', process.env.MONGO_URI);
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connection successful!');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        
        // Close the connection
        await mongoose.disconnect();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testConnection();