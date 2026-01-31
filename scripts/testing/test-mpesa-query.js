require('dotenv').config();
const mpesaService = require('./services/mpesaService');

const checkoutRequestID = process.argv[2];

if (!checkoutRequestID) {
    console.log('❌ Please provide CheckoutRequestID');
    console.log('Usage: node test-mpesa-query.js ws_CO_XXXXXXXXX');
    process.exit(1);
}

console.log('🔍 M-Pesa Payment Status Query\n');
console.log('Checkout Request ID:', checkoutRequestID);
console.log('\n' + '='.repeat(50) + '\n');

(async () => {
    try {
        console.log('🔐 Getting OAuth token...');
        const token = await mpesaService.getAccessToken();
        console.log('✅ Token obtained\n');
        
        console.log('🔍 Querying payment status...\n');
        const result = await mpesaService.querySTKPush(checkoutRequestID);
        
        console.log('='.repeat(50));
        if (result.success) {
            console.log('✅ QUERY SUCCESSFUL!\n');
            console.log('Result Code:', result.resultCode);
            console.log('Result Description:', result.resultDesc);
            
            // Interpret result codes
            console.log('\n📊 Payment Status:');
            switch(result.resultCode) {
                case '0':
                    console.log('✅ PAYMENT COMPLETED SUCCESSFULLY');
                    break;
                case '1032':
                    console.log('❌ Payment cancelled by user');
                    break;
                case '1037':
                    console.log('⏱️  Payment timeout - user did not respond');
                    break;
                case '1':
                    console.log('💰 Insufficient balance');
                    break;
                case '1001':
                    console.log('❌ Invalid M-Pesa PIN');
                    break;
                default:
                    console.log('⚠️  Status:', result.resultDesc);
            }
            
            console.log('\n📋 Full Response:');
            console.log(JSON.stringify(result.data, null, 2));
            
        } else {
            console.log('❌ QUERY FAILED!\n');
            console.log('Error:', result.error);
        }
        console.log('='.repeat(50) + '\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
})();
