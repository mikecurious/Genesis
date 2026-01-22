require('dotenv').config({ path: __dirname + '/../.env' });
const nodemailer = require('nodemailer');

const smtpServers = [
    { host: 'smtp.titan.email', port: 465, secure: true, name: 'Titan Email (SSL)' },
    { host: 'smtp.titan.email', port: 587, secure: false, name: 'Titan Email (STARTTLS)' },
    { host: 'smtp.mail.titan.com', port: 465, secure: true, name: 'Titan Mail (SSL)' },
    { host: 'smtp.mail.titan.com', port: 587, secure: false, name: 'Titan Mail (STARTTLS)' },
    { host: 'smtp.titanmail.com', port: 465, secure: true, name: 'TitanMail (SSL)' },
    { host: 'smtp.titanmail.com', port: 587, secure: false, name: 'TitanMail (STARTTLS)' },
];

async function testSmtpServer(config) {
    console.log(`\n🔍 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port} (${config.secure ? 'SSL' : 'STARTTLS'})`);

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    try {
        await transporter.verify();
        console.log(`   ✅ SUCCESS! This configuration works!\n`);
        console.log(`   Update your .env file with:`);
        console.log(`   EMAIL_HOST=${config.host}`);
        console.log(`   EMAIL_PORT=${config.port}`);
        console.log(`   EMAIL_SECURE=${config.secure}`);
        return true;
    } catch (error) {
        if (error.code === 'EAUTH') {
            console.log(`   ❌ Connection OK but authentication failed`);
            console.log(`   Error: ${error.message}`);
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log(`   ⚠️  Server not reachable: ${error.code}`);
        } else {
            console.log(`   ❌ Failed: ${error.message}`);
        }
        return false;
    }
}

async function testAllServers() {
    console.log('🚀 Testing all possible Titan SMTP configurations...\n');
    console.log(`Using credentials:`);
    console.log(`  User: ${process.env.EMAIL_USER}`);
    console.log(`  Password: ${process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-3) : 'NOT SET'}`);

    let foundWorking = false;

    for (const config of smtpServers) {
        const works = await testSmtpServer(config);
        if (works) {
            foundWorking = true;
            break;
        }
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!foundWorking) {
        console.log('\n❌ None of the SMTP configurations worked.\n');
        console.log('🔍 This suggests one of the following issues:');
        console.log('   1. The password is incorrect');
        console.log('   2. The email account is not fully activated');
        console.log('   3. SMTP access is blocked on your account');
        console.log('   4. Two-factor authentication requires an app password\n');
        console.log('📋 Next steps:');
        console.log('   1. Try logging into https://mail.titan.email');
        console.log('   2. Verify you can send/receive emails from the web interface');
        console.log('   3. Check with Titan support if SMTP is enabled for your plan');
        console.log('   4. Reset your password if needed\n');
    }
}

testAllServers();
