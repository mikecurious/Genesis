/**
 * Test M-Pesa Payment Integration
 * This script tests the M-Pesa STK Push functionality
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mpesaService = require('../services/mpesaService');

async function testMpesaPayment() {
    console.log('🧪 M-Pesa Payment Integration Test\n');
    console.log('='.repeat(60));

    // Check configuration
    console.log('📋 Configuration Status:');
    console.log(`   Configured: ${mpesaService.isConfigured}`);
    console.log(`   Environment: ${mpesaService.environment || 'Not set'}`);
    console.log(`   Business Shortcode: ${mpesaService.businessShortCode || 'Not set'}`);
    console.log(`   Callback URL: ${mpesaService.callbackURL || 'Not set'}`);
    console.log('='.repeat(60));

    if (!mpesaService.isConfigured) {
        console.error('\n❌ M-Pesa is not configured. Please check your .env file.');
        console.error('\nRequired environment variables:');
        console.error('   - MPESA_CONSUMER_KEY');
        console.error('   - MPESA_CONSUMER_SECRET');
        console.error('   - MPESA_BUSINESS_SHORTCODE');
        console.error('   - MPESA_PASSKEY');
        console.error('   - MPESA_CALLBACK_URL');
        process.exit(1);
    }

    console.log('\n🔐 Step 1: Testing OAuth Token Generation...');
    try {
        const token = await mpesaService.getAccessToken();
        console.log('✅ OAuth token acquired successfully');
        console.log(`   Token (first 20 chars): ${token.substring(0, 20)}...`);
    } catch (error) {
        console.error('❌ OAuth token failed:', error.message);
        process.exit(1);
    }

    console.log('\n💰 Step 2: Testing STK Push (using Safaricom test number)...');
    console.log('   Note: Using Safaricom sandbox test number 254708374149');
    console.log('   Amount: 1 KES (minimum test amount)');

    try {
        const result = await mpesaService.initiateSTKPush(
            '254708374149', // Safaricom sandbox test number
            1, // 1 KES for testing
            'TEST-' + Date.now(),
            'Test Payment'
        );

        console.log('\n📊 STK Push Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n✅ STK Push initiated successfully!');
            console.log('   Merchant Request ID:', result.merchantRequestID);
            console.log('   Checkout Request ID:', result.checkoutRequestID);
            console.log('   Response Code:', result.responseCode);
            console.log('   Message:', result.responseDescription);

            // Test query
            console.log('\n🔍 Step 3: Testing STK Push Query...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

            const queryResult = await mpesaService.querySTKPush(result.checkoutRequestID);
            console.log('\n📊 Query Result:');
            console.log(JSON.stringify(queryResult, null, 2));

            if (queryResult.success) {
                console.log('\n✅ Query successful!');
                console.log('   Result Code:', queryResult.resultCode);
                console.log('   Result Description:', queryResult.resultDesc);
            } else {
                console.log('\n⚠️  Query had issues:', queryResult.error);
            }
        } else {
            console.log('\n❌ STK Push failed!');
            console.log('   Error:', result.error);
        }
    } catch (error) {
        console.error('\n❌ STK Push error:', error.message);
        console.error(error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 Test Complete\n');
}

// Run the test
testMpesaPayment().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
