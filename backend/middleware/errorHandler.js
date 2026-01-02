const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev only (hide stack traces in production)
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    } else {
        console.error('Error:', err.message);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { statusCode: 404, message };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'unknown';
        const value = err.keyValue ? JSON.stringify(err.keyValue) : 'unknown';
        const message = `Duplicate value for field '${field}': ${value}`;
        console.error('Duplicate key error:', { field, value, keyPattern: err.keyPattern, keyValue: err.keyValue });
        error = { statusCode: 400, message };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { statusCode: 400, message };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    });
};

module.exports = { errorHandler };
