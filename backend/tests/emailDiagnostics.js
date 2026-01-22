require('dotenv').config({ path: __dirname + '/../.env' });
const nodemailer = require('nodemailer');

async function testEmailConnection() {
    console.log('🔍 Email Connection Diagnostics\n');
    console.log('Configuration:');
    console.log('  HOST:', process.env.EMAIL_HOST);
    console.log('  PORT:', process.env.EMAIL_PORT);
    console.log('  SECURE:', process.env.EMAIL_SECURE);
    console.log('  USER:', process.env.EMAIL_USER);
    console.log('  PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-3) : 'NOT SET');
    console.log('  FROM:', process.env.EMAIL_FROM);
    console.log('\n');

    // Test 1: Basic connection
    console.log('Test 1: Testing SMTP connection...');
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        debug: true, // Enable debug output
        logger: true // Enable logger
    });

    try {
        console.log('\nAttempting to verify connection...');
        await transporter.verify();
        console.log('✅ Connection successful! SMTP credentials are valid.\n');

        // Test 2: Send a test email
        console.log('Test 2: Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email from MyGF AI Platform',
            text: 'This is a test email to verify your Titan Email configuration is working correctly.',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>✅ Email Configuration Test Successful!</h2>
                    <p>Your Titan Email SMTP configuration is working correctly.</p>
                    <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated test email from MyGF AI Platform.
                    </p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n✨ All tests passed! Your email configuration is working.\n');

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error details:');
        console.error('  Code:', error.code);
        console.error('  Message:', error.message);
        console.error('  Command:', error.command);

        console.log('\n📋 Troubleshooting steps:');
        console.log('  1. Verify your password is correct in Titan Email');
        console.log('  2. Check if SMTP access is enabled in your Titan account settings');
        console.log('  3. Try logging into https://mail.titan.email with these credentials');
        console.log('  4. Check if 2FA is enabled (you may need an app-specific password)');
        console.log('  5. Verify your account is fully activated');
        console.log('\n  Alternative SMTP servers to try:');
        console.log('    - smtp.mail.titan.com');
        console.log('    - smtp.titanmail.com');
        console.log('\n');

        process.exit(1);
    }
}

testEmailConnection();
