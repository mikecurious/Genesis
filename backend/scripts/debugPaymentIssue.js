/**
 * Debug Payment Issue for Demo Agent Account
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');

async function debugPaymentIssue() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🔍 Searching for demo agent account...\n');

        // Find user with "demo" or "agent" in email
        const demoUsers = await User.find({
            $or: [
                { email: /demo/i },
                { email: /agent/i },
                { email: /test/i }
            ]
        }).select('name email role phone subscription').limit(10);

        console.log(`Found ${demoUsers.length} potential demo/test users:\n`);
        demoUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Phone: ${user.phone || 'Not set'}`);
            console.log(`   Subscription: ${user.subscription?.plan || 'None'} (${user.subscription?.status || 'inactive'})`);
            console.log('');
        });

        if (demoUsers.length > 0) {
            const demoUser = demoUsers[0];
            console.log(`\n📊 Checking payment history for ${demoUser.email}...\n`);

            const payments = await Payment.find({ user: demoUser._id })
                .sort({ createdAt: -1 })
                .limit(10);

            console.log(`Found ${payments.length} payment attempts:\n`);
            payments.forEach((payment, index) => {
                console.log(`${index + 1}. Payment ${payment._id}`);
                console.log(`   Plan: ${payment.plan || 'N/A'}`);
                console.log(`   Amount: ${payment.amount} KES`);
                console.log(`   Phone: ${payment.phoneNumber}`);
                console.log(`   Status: ${payment.status}`);
                console.log(`   Result: ${payment.resultDesc || 'N/A'}`);
                console.log(`   Created: ${payment.createdAt}`);
                console.log(`   Checkout ID: ${payment.checkoutRequestID || 'N/A'}`);
                console.log('');
            });

            // Check for common issues
            console.log('🔍 Common Issues Check:\n');

            // Issue 1: Invalid phone number
            if (!demoUser.phone || demoUser.phone === '') {
                console.log('⚠️  Issue: User has no phone number set');
                console.log('   Solution: User needs to add phone number in profile\n');
            } else if (!/^254\d{9}$/.test(demoUser.phone)) {
                console.log('⚠️  Issue: Phone number format is invalid');
                console.log(`   Current: ${demoUser.phone}`);
                console.log('   Expected: 254XXXXXXXXX (e.g., 254712345678)\n');
            } else {
                console.log(`✅ Phone number format is valid: ${demoUser.phone}\n`);
            }

            // Issue 2: Recent failed payments
            const recentFailed = payments.filter(p =>
                p.status === 'failed' &&
                new Date(p.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            );

            if (recentFailed.length > 0) {
                console.log(`⚠️  Issue: ${recentFailed.length} failed payment(s) in last 24 hours`);
                recentFailed.forEach((p, i) => {
                    console.log(`   ${i + 1}. ${p.resultDesc || 'Unknown error'}`);
                });
                console.log('');
            }

            // Issue 3: Pending payments
            const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing');
            if (pending.length > 0) {
                console.log(`⚠️  Issue: ${pending.length} payment(s) still pending/processing`);
                console.log('   These may need manual verification\n');
            }
        }

        console.log('='.repeat(60));
        console.log('\n💡 Troubleshooting Tips:\n');
        console.log('1. For M-Pesa sandbox testing, use: 254708374149');
        console.log('2. For production, ensure phone number is in format: 254XXXXXXXXX');
        console.log('3. User must have sufficient M-Pesa balance');
        console.log('4. Check if user is entering correct PIN on phone');
        console.log('5. M-Pesa sandbox may reject some test numbers\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugPaymentIssue();
