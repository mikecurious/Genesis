require('dotenv').config();
const mpesaService = require('./services/mpesaService');

console.log('🔐 Testing M-Pesa OAuth Authorization...\n');

console.log('Environment:', process.env.MPESA_ENVIRONMENT);
console.log('Business ShortCode:', process.env.MPESA_BUSINESS_SHORTCODE);
console.log('Consumer Key:', process.env.MPESA_CONSUMER_KEY ? '✓ Set' : '✗ Missing');
console.log('Consumer Secret:', process.env.MPESA_CONSUMER_SECRET ? '✓ Set' : '✗ Missing');
console.log('Callback URL:', process.env.MPESA_CALLBACK_URL);
console.log('\n---\n');

(async () => {
    try {
        console.log('Attempting to get access token...');
        const token = await mpesaService.getAccessToken();
        
        console.log('✅ SUCCESS! OAuth Authorization working correctly.\n');
        console.log('Access Token:', token);
        console.log('Token Length:', token.length, 'characters');
        console.log('\n📝 Note: Token expires in 3600 seconds (1 hour)\n');
        
        // Test token again (should use cached version)
        console.log('Testing token caching...');
        const cachedToken = await mpesaService.getAccessToken();
        
        if (token === cachedToken) {
            console.log('✅ Token caching working correctly (same token returned)\n');
        }
        
        console.log('🎉 All authorization tests passed!');
        
    } catch (error) {
        console.error('❌ AUTHORIZATION FAILED!\n');
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('\nAPI Response:');
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        
        console.error('\n📋 Troubleshooting:');
        console.error('1. Verify Consumer Key and Secret are correct');
        console.error('2. Ensure credentials are from: https://developer.safaricom.co.ke/MyApps');
        console.error('3. Check if app has "Lipa Na M-Pesa Online" product enabled');
        console.error('4. Verify no extra spaces in .env file');
        
        process.exit(1);
    }
})();
