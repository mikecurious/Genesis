const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mpesaService = require('../services/mpesaService');
const mongoose = require('mongoose');

async function checkStatus() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const checkoutRequestID = 'ws_CO_02012026212905999758930908';
        
        console.log(`🔍 Querying STK Push status for: ${checkoutRequestID}\n`);
        
        const result = await mpesaService.querySTKPush(checkoutRequestID, 'paybill');
        
        console.log('📥 M-Pesa Response:');
        console.log(JSON.stringify(result, null, 2));
        console.log('');
        
        if (result.success) {
            console.log(`Result Code: ${result.resultCode}`);
            console.log(`Result Description: ${result.resultDesc}`);
            
            if (result.resultCode === '0') {
                console.log('✅ Payment was SUCCESSFUL!');
            } else if (result.resultCode === '1032') {
                console.log('❌ Payment was CANCELLED by user');
            } else if (result.resultCode === '1') {
                console.log('❌ Payment FAILED - Insufficient balance');
            } else if (result.resultCode === '1037') {
                console.log('⏳ Request TIMEOUT - User did not respond');
            } else {
                console.log(`⚠️ Other status: ${result.resultDesc}`);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkStatus();
