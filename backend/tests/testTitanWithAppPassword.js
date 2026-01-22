require('dotenv').config({ path: __dirname + '/../.env' });
const nodemailer = require('nodemailer');

console.log('🔍 Testing Titan Email with different authentication methods\n');
console.log('Current credentials:');
console.log('  User:', process.env.EMAIL_USER);
console.log('  Password:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-3) : 'NOT SET');
console.log('\n');

console.log('📋 INSTRUCTIONS:');
console.log('─────────────────────────────────────────────────────────────');
console.log('Since smtp.titan.email connects but authentication fails,');
console.log('you may need to create an "App Password" in Titan Email.');
console.log('\n');
console.log('Steps to create an App Password in Titan Email:');
console.log('1. Log into https://mail.titan.email');
console.log('2. Go to Settings → Security or Account Settings');
console.log('3. Look for "App Passwords" or "External Applications"');
console.log('4. Generate a new app password for "Mail/SMTP"');
console.log('5. Copy the generated password');
console.log('6. Update your .env file:');
console.log('   EMAIL_HOST=smtp.titan.email');
console.log('   EMAIL_PORT=465');
console.log('   EMAIL_SECURE=true');
console.log('   EMAIL_PASSWORD=<paste-the-app-password-here>');
console.log('\n');
console.log('Alternative: Check Titan Email documentation at');
console.log('https://support.titan.email for SMTP setup instructions');
console.log('─────────────────────────────────────────────────────────────');
console.log('\n');

console.log('📧 Would you like to test with the current settings? (smtp.titan.email)');
console.log('This will help confirm if the server is accessible.\n');

async function testConnection() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.titan.email',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SUCCESS! Authentication worked!');
    } catch (error) {
        console.log('❌ Authentication failed:', error.message);
        console.log('\nThis confirms you need to either:');
        console.log('  1. Create an app-specific password in Titan Email, OR');
        console.log('  2. Contact Titan support to enable SMTP access');
    }
}

testConnection();
