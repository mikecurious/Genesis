/**
 * Environment Variable Validation
 * Ensures all required environment variables are present before starting the server
 */

const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'FRONTEND_URL'
];

const optionalEnvVars = [
    'EMAIL_FROM',
    'EMAIL_SECURE',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_NUMBER',
    'GOOGLE_CLIENT_ID',
    'GEMINI_API_KEY',
    'GEMINI_MODEL_NAME'
];

function validateEnv() {
    console.log('🔍 Validating environment variables...\n');

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => console.error(`   - ${varName}`));
        console.error('\n📝 Please check your .env file and ensure all required variables are set.');
        console.error('💡 Refer to .env.example for the complete list of variables.\n');
        process.exit(1);
    }

    // Check for weak JWT secret
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security.');
        console.warn('   Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
        console.warn('');
    }

    // Warn about missing optional variables
    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    if (missingOptional.length > 0) {
        console.warn('⚠️  Missing optional environment variables (some features may not work):');
        missingOptional.forEach(varName => console.warn(`   - ${varName}`));
        console.warn('');
    }

    // Show environment info
    console.log('✅ All required environment variables are set');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔌 Port: ${process.env.PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log('');
}

module.exports = validateEnv;
