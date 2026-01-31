require('dotenv').config();
const axios = require('axios');

async function testPayment() {
    try {
        console.log('🧪 Testing Payment Initiation\n');

        // First, login to get a token
        console.log('1️⃣ Logging in as demo agent...');
        const loginResponse = await axios.post('https://genesis-hezn.onrender.com/api/auth/login', {
            email: 'agent@gmail.com',
            password: 'password'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful\n');

        // Try to initiate payment
        console.log('2️⃣ Initiating payment with phone: 0758930908');
        console.log('   Plan: Basic');
        console.log('   Mode: paybill\n');

        const paymentResponse = await axios.post(
            'https://genesis-hezn.onrender.com/api/payments/initiate',
            {
                plan: 'Basic',
                phoneNumber: '0758930908',
                mpesaMode: 'paybill'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Payment initiated successfully!');
        console.log(JSON.stringify(paymentResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Payment initiation failed:');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received');
            console.error(error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testPayment();
