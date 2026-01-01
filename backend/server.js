
const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const websocketService = require('./services/websocketService');
const logger = require('./config/logger');

// Load env vars
dotenv.config({ path: __dirname + '/.env' });

// Validate environment variables
const validateEnv = require('./config/validateEnv');
validateEnv();

// Log startup
logger.info('Starting Genesis Backend Server...');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Trust proxy - required for rate limiting and IP detection behind reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Initialize WebSocket service
websocketService.initialize(server);

// Initialize automated services (cron jobs)
const rentReminderService = require('./services/rentReminderService');
const leadScoringService = require('./services/leadScoringService');

// Start cron jobs
rentReminderService.initialize();
leadScoringService.initialize();

logger.info('✅ Automated services initialized (rent reminders, lead scoring)');

// Middleware
// CORS configuration - allow frontend URL from environment or default to localhost
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(helmet()); // Set security headers

// Request logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: logger.stream }));
} else {
    app.use(morgan('dev'));
}

app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
    const health = {
        success: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        services: {}
    };

    // Check database connection
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            health.services.database = {
                status: 'healthy',
                type: 'MongoDB Atlas',
                connected: true
            };
        } else {
            health.services.database = {
                status: 'unhealthy',
                connected: false,
                readyState: mongoose.connection.readyState
            };
            health.success = false;
        }
    } catch (error) {
        health.services.database = {
            status: 'unhealthy',
            error: error.message
        };
        health.success = false;
    }

    // Check email service (basic check)
    try {
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            health.services.email = {
                status: 'configured',
                host: process.env.EMAIL_HOST
            };
        } else {
            health.services.email = {
                status: 'not_configured'
            };
        }
    } catch (error) {
        health.services.email = {
            status: 'error',
            error: error.message
        };
    }

    // Check WebSocket service
    try {
        const onlineUsers = websocketService.getOnlineUsersCount();
        health.services.websocket = {
            status: 'healthy',
            onlineUsers: onlineUsers
        };
    } catch (error) {
        health.services.websocket = {
            status: 'error',
            error: error.message
        };
    }

    // Check API services configuration
    health.services.gemini = {
        status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
    };

    health.services.groq = {
        status: process.env.GROQ_API_KEY ? 'configured' : 'not_configured'
    };

    health.services.cloudinary = {
        status: (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
            ? 'configured'
            : 'not_configured'
    };

    const statusCode = health.success ? 200 : 503;
    res.status(statusCode).json(health);
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
app.use('/api/agent', require('./routes/agent')); // Agent profile routes
app.use('/api/ai-chat', require('./routes/aiChat')); // AI Chat routes for property search
app.use('/api/features', require('./routes/newFeatures')); // New features routes (lead scoring, rent reminders, financial reports, surveyor requests)
app.use('/api/tenants', require('./routes/tenants')); // Tenant management routes
app.use('/api/financial-reports', require('./routes/financialReporting')); // Comprehensive financial reporting with AI insights
app.use('/api/role-intelligence', require('./routes/roleIntelligence')); // AI-powered role detection and optimization
app.use('/api/feature-settings', require('./routes/featureSettings')); // Feature control & settings panel
app.use('/api/surveyor-chat', require('./routes/surveyorChat')); // Chat-based surveyor request and matching
app.use('/api/sales-automation', require('./routes/salesAutomation')); // AI sales & deal closure engine

// Custom Error Handler Middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`Health check available at: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', { error: err.message, stack: err.stack });
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');

    // Stop cron jobs
    rentReminderService.stop();
    leadScoringService.stop();

    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
