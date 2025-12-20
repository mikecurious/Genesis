const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is not set');

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            directConnection: false, // Required for MongoDB Atlas SRV connections
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        process.exit(1);
    }
};

module.exports = connectDB;
