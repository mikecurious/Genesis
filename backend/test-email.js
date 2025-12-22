/**
 * Test email configuration
 * Run with: node test-email.js
 */

require('dotenv').config();
const sendEmail = require('./config/email');

async function testEmail() {
    console.log('🧪 Testing email configuration...\n');

    console.log('Environment variables:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log();

    const testCode = '123456';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Test Email - MyGF AI</h2>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px;">${testCode}</span>
                </div>
            </div>
            <p>If you received this email, your email configuration is working! ✅</p>
        </div>
    `;

    try {
        console.log('📧 Sending test email...');
        const result = await sendEmail({
            email: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email - MyGF AI Email Configuration',
            html
        });

        console.log('\n✅ SUCCESS! Email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('\nCheck your inbox:', process.env.EMAIL_USER);
    } catch (error) {
        console.error('\n❌ FAILED! Email could not be sent.');
        console.error('Error:', error.message);
        console.error('\nCommon issues:');
        console.error('1. Gmail App Password not set correctly in .env');
        console.error('2. "Less secure app access" enabled (if using regular password)');
        console.error('3. 2-Factor Authentication not enabled on Gmail');
        console.error('4. EMAIL_PASSWORD variable name mismatch');
        console.error('\nTo fix:');
        console.error('1. Go to https://myaccount.google.com/apppasswords');
        console.error('2. Generate a new app password');
        console.error('3. Update EMAIL_PASSWORD in your .env file');
        console.error('4. Make sure NODE_ENV=production in .env');
    }
}

testEmail();
