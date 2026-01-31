require('dotenv').config();
const axios = require('axios');

async function checkPaymentEndpoint() {
    console.log('🔍 Checking Payment Endpoint Details\n');

    // Test the payment methods endpoint
    console.log('1️⃣ Testing GET /api/payments/methods');
    try {
        const methodsResponse = await axios.get('https://genesis-hezn.onrender.com/api/payments/methods');
        console.log('✅ Payment methods:', JSON.stringify(methodsResponse.data, null, 2));
    } catch (error) {
        console.error('❌ Failed to get payment methods:', error.message);
    }

    console.log('\n2️⃣ Testing phone number formats:');
    const phoneNumbers = ['0758930908', '254758930908', '+254758930908', '758930908'];

    phoneNumbers.forEach(phone => {
        const cleaned = phone.replace(/\D/g, '');
        let formatted;

        if (cleaned.startsWith('254')) {
            formatted = cleaned;
        } else if (cleaned.startsWith('0')) {
            formatted = '254' + cleaned.substring(1);
        } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
            formatted = '254' + cleaned;
        } else {
            formatted = cleaned;
        }

        const isValid = /^254\d{9}$/.test(formatted);
        console.log(`   ${phone} → ${formatted} (${isValid ? '✅ Valid' : '❌ Invalid'})`);
    });

    console.log('\n3️⃣ Checking M-Pesa configuration from .env:');
    console.log('   Environment:', process.env.MPESA_ENVIRONMENT);
    console.log('   Paybill Shortcode:', process.env.MPESA_PAYBILL_SHORTCODE);
    console.log('   Consumer Key exists:', !!process.env.MPESA_CONSUMER_KEY);
    console.log('   Consumer Secret exists:', !!process.env.MPESA_CONSUMER_SECRET);
    console.log('   Passkey exists:', !!process.env.MPESA_PAYBILL_PASSKEY);
    console.log('   Callback URL:', process.env.MPESA_CALLBACK_URL);
}

checkPaymentEndpoint();
