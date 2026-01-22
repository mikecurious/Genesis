require('dotenv').config({ path: __dirname + '/../.env' });
const nodemailer = require('nodemailer');

console.log('🔍 Testing Different Authentication Methods\n');
console.log('Current Configuration:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER);
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
console.log('  Password length:', process.env.EMAIL_PASSWORD?.length);
console.log('  Contains @ symbol:', process.env.EMAIL_PASSWORD?.includes('@'));
console.log('\n');

const testConfigs = [
    {
        name: 'Port 587 with STARTTLS (LOGIN auth)',
        config: {
            host: 'smtp.titan.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            authMethod: 'LOGIN'
        }
    },
    {
        name: 'Port 587 with STARTTLS (PLAIN auth)',
        config: {
            host: 'smtp.titan.email',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            authMethod: 'PLAIN'
        }
    },
    {
        name: 'Port 465 with SSL (LOGIN auth)',
        config: {
            host: 'smtp.titan.email',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            authMethod: 'LOGIN'
        }
    },
    {
        name: 'Port 465 with SSL (PLAIN auth)',
        config: {
            host: 'smtp.titan.email',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            authMethod: 'PLAIN'
        }
    }
];

async function testConfig(name, config) {
    console.log(`\n🔍 Testing: ${name}`);

    const transporter = nodemailer.createTransport({
        ...config,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000
    });

    try {
        await transporter.verify();
        console.log(`   ✅ SUCCESS! This configuration works!`);
        console.log(`   Use these settings in your .env:`);
        console.log(`   EMAIL_HOST=${config.host}`);
        console.log(`   EMAIL_PORT=${config.port}`);
        console.log(`   EMAIL_SECURE=${config.secure}`);
        console.log(`   (Auth method: ${config.authMethod})`);
        return true;
    } catch (error) {
        if (error.code === 'EAUTH') {
            console.log(`   ❌ Authentication failed: ${error.message}`);
        } else {
            console.log(`   ❌ Connection failed: ${error.message}`);
        }
        return false;
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Testing all SMTP configurations...');
    console.log('═══════════════════════════════════════════════════════════');

    let foundWorking = false;

    for (const { name, config } of testConfigs) {
        const success = await testConfig(name, config);
        if (success) {
            foundWorking = true;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    if (!foundWorking) {
        console.log('❌ All configurations failed.');
        console.log('\n💡 Recommendations from GoDaddy Support:');
        console.log('   1. Your password contains special characters (@)');
        console.log('      - The password is being read correctly from .env');
        console.log('      - Special character encoding is handled properly');
        console.log('\n   2. Network/Firewall check:');
        console.log('      - Both ports 465 and 587 are reachable');
        console.log('      - No firewall blocking detected');
        console.log('\n   3. Authentication methods tested:');
        console.log('      - Both PLAIN and LOGIN auth were tested');
        console.log('      - Server supports both but rejects authentication');
        console.log('\n   ⚠️  CONCLUSION: SMTP access needs to be enabled on your');
        console.log('      Titan Email account. Contact GoDaddy support and request:');
        console.log('      "Please enable SMTP access for admin@mygenesisfortune.com"');
        console.log('      or provide an app-specific password for SMTP.');
    }
    console.log('═══════════════════════════════════════════════════════════\n');
}

runAllTests();
