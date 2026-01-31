const sendEmail = require('../config/email');
require('dotenv').config();

async function testOAuthEmail() {
    console.log('\n🔍 Testing Gmail SMTP OAuth2...\n');

    // Check if OAuth credentials are present
    const hasOAuth = Boolean(
        process.env.EMAIL_USER &&
        process.env.EMAIL_OAUTH_CLIENT_ID &&
        process.env.EMAIL_OAUTH_CLIENT_SECRET &&
        process.env.EMAIL_OAUTH_REFRESH_TOKEN
    );

    if (!hasOAuth) {
        console.log('❌ OAuth credentials missing!');
        console.log('Required:');
        console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? '✅' : '❌');
        console.log('  - EMAIL_OAUTH_CLIENT_ID:', process.env.EMAIL_OAUTH_CLIENT_ID ? '✅' : '❌');
        console.log('  - EMAIL_OAUTH_CLIENT_SECRET:', process.env.EMAIL_OAUTH_CLIENT_SECRET ? '✅' : '❌');
        console.log('  - EMAIL_OAUTH_REFRESH_TOKEN:', process.env.EMAIL_OAUTH_REFRESH_TOKEN ? '✅' : '❌');
        process.exit(1);
    }

    console.log('✅ All OAuth credentials present!');
    console.log(`📧 Sending test email to: ${process.env.EMAIL_USER}\n`);

    try {
        await sendEmail({
            email: process.env.EMAIL_USER,
            subject: 'OAuth2 Test Email - MyGenesis Fortune',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">🎉 OAuth2 Configuration Successful!</h2>
                    <p>This email confirms that your Gmail SMTP OAuth2 is working correctly.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Configuration Details:</strong></p>
                        <ul>
                            <li>Email User: ${process.env.EMAIL_USER}</li>
                            <li>Authentication: OAuth2</li>
                            <li>Status: ✅ Active</li>
                        </ul>
                    </div>
                    <p style="color: #666; font-size: 12px;">
                        Sent from MyGenesis Fortune - OAuth2 Test Script
                    </p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📬 Check your inbox at:', process.env.EMAIL_USER);
        console.log('\n🎉 Gmail SMTP OAuth2 is working correctly!\n');
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Verify OAuth credentials in .env file');
        console.error('2. Check that refresh token is valid (not expired)');
        console.error('3. Ensure Gmail API is enabled in Google Cloud Console');
        console.error('4. Check that the email account matches the OAuth credentials\n');
        process.exit(1);
    }
}

testOAuthEmail();
