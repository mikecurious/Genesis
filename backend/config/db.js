const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use logger if available, fallback to console
        const log = {
            info: (msg) => {
                try {
                    require('./logger').info(msg);
                } catch {
                    console.log(msg);
                }
            },
            error: (msg) => {
                try {
                    require('./logger').error(msg);
                } catch {
                    console.error(msg);
                }
            }
        };

        log.info('Attempting to connect to MongoDB...');
        log.info('MongoDB URI: ' + (process.env.MONGO_URI ? 'URI is set' : 'URI is not set'));

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            directConnection: false, // Required for MongoDB Atlas SRV connections
        });

        log.info(`MongoDB Connected: ${conn.connection.host}`);
        log.info(`Database Name: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            log.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            log.error('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            log.info('MongoDB reconnected');
        });

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        process.exit(1);
    }
};

module.exports = connectDB;
