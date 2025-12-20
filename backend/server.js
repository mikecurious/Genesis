
const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const websocketService = require('./services/websocketService');

// Load env vars
dotenv.config({ path: __dirname + '/.env' });

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
websocketService.initialize(server);

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3000"
    ],
    credentials: true
})); // Enable CORS with multiple origins
app.use(helmet()); // Set security headers
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend server is running!',
        timestamp: new Date().toISOString(),
        database: 'Connected to MongoDB Atlas'
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/properties', require('./routes/smartQuery')); // Smart query routes
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/leads', require('./routes/leads')); // Lead management routes
app.use('/api/notifications', require('./routes/notifications')); // Notification routes
app.use('/api/analytics', require('./routes/analytics')); // Analytics routes
app.use('/api/verification', require('./routes/verification')); // Verification Center routes
app.use('/api/surveyor', require('./routes/surveyor')); // Surveyor routes
app.use('/api/survey-requests', require('./routes/surveyRequests')); // Survey request routes
app.use('/api/ai-chat', require('./routes/aiChat')); // AI Chat routes for property search

// Custom Error Handler Middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
