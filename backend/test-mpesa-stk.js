require('dotenv').config();
const mpesaService = require('./services/mpesaService');

console.log('💳 M-Pesa STK Push Test\n');
console.log('='.repeat(50));
console.log('\n📋 Configuration:');
console.log('Environment:', process.env.MPESA_ENVIRONMENT);
console.log('Business ShortCode:', process.env.MPESA_BUSINESS_SHORTCODE);
console.log('Callback URL:', process.env.MPESA_CALLBACK_URL);
console.log('\n' + '='.repeat(50) + '\n');

// Get phone number from command line or use default
const phoneNumber = process.argv[2] || '254712345678';
const amount = parseInt(process.argv[3]) || 1; // Default 1 KES for testing

console.log('📞 Phone Number:', phoneNumber);
console.log('💰 Amount: KES', amount);
console.log('\n⚠️  NOTE: In sandbox mode, enter any PIN to complete payment\n');

(async () => {
    try {
        console.log('🔐 Step 1: Getting OAuth token...');
        const token = await mpesaService.getAccessToken();
        console.log('✅ Token obtained:', token.substring(0, 20) + '...');
        
        console.log('\n📱 Step 2: Initiating STK Push...');
        const result = await mpesaService.initiateSTKPush(
            phoneNumber,
            amount,
            'TEST-' + Date.now(),
            'Test Payment from Genesis'
        );
        
        console.log('\n' + '='.repeat(50));
        if (result.success) {
            console.log('✅ STK PUSH SUCCESSFUL!');
            console.log('\n📊 Response Details:');
            console.log('Merchant Request ID:', result.merchantRequestID);
            console.log('Checkout Request ID:', result.checkoutRequestID);
            console.log('Response Code:', result.responseCode);
            console.log('Response Description:', result.responseDescription);
            console.log('Customer Message:', result.customerMessage);
            
            console.log('\n📱 NEXT STEPS:');
            console.log('1. Check phone', phoneNumber, 'for STK push prompt');
            console.log('2. Enter your M-Pesa PIN (any PIN works in sandbox)');
            console.log('3. Callback will be sent to:', process.env.MPESA_CALLBACK_URL);
            
            console.log('\n🔍 To query payment status:');
            console.log('   node test-mpesa-query.js', result.checkoutRequestID);
            
        } else {
            console.log('❌ STK PUSH FAILED!');
            console.log('\n❌ Error:', result.error);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check phone number format (254XXXXXXXXX)');
            console.log('2. Verify M-Pesa credentials in .env');
            console.log('3. Ensure callback URL is accessible');
        }
        console.log('='.repeat(50) + '\n');
        
        process.exit(result.success ? 0 : 1);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\n📋 Full Error:', error);
        process.exit(1);
    }
})();
