const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = process.env.EMAIL_OAUTH_CLIENT_ID || process.argv[2];
const CLIENT_SECRET = process.env.EMAIL_OAUTH_CLIENT_SECRET || process.argv[3];
const REDIRECT_URI = process.env.EMAIL_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/gmail/callback';

const SCOPES = ['https://mail.google.com/'];

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Error: Missing OAuth credentials!');
    console.log('\nUsage:');
    console.log('  node scripts/gmail-smtp-auth.js <CLIENT_ID> <CLIENT_SECRET>');
    console.log('\nOr set in .env:');
    console.log('  EMAIL_OAUTH_CLIENT_ID=your_client_id');
    console.log('  EMAIL_OAUTH_CLIENT_SECRET=your_client_secret');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
});

console.log('\n════════════════════════════════════════════════════════');
console.log('   Gmail SMTP OAuth2 Setup');
console.log('════════════════════════════════════════════════════════\n');

console.log('📋 Step 1: Authorize this app by visiting this URL:');
console.log('\n' + authUrl + '\n');

console.log('📋 Step 2: Sign in with your Google Workspace account');
console.log('📋 Step 3: Grant the requested permissions');
console.log('📋 Step 4: Copy the authorization code from the redirect URL');
console.log('          (Look for the "code=" parameter in the URL)\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the authorization code: ', async (code) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);

        console.log('\n✅ Success! Tokens received.\n');
        console.log('════════════════════════════════════════════════════════');
        console.log('   Add these to your .env file:');
        console.log('════════════════════════════════════════════════════════\n');
        console.log(`EMAIL_OAUTH_CLIENT_ID=${CLIENT_ID}`);
        console.log(`EMAIL_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`EMAIL_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);

        if (tokens.refresh_token) {
            console.log('✅ Refresh token obtained successfully!');
        } else {
            console.log('⚠️  Warning: No refresh token received.');
            console.log('   Make sure you:');
            console.log('   1. Revoked previous access in Google Account settings');
            console.log('   2. Used access_type=offline in the auth URL');
            console.log('   3. Used prompt=consent to force new token');
        }

        console.log('\n════════════════════════════════════════════════════════');
        console.log('   Next Steps:');
        console.log('════════════════════════════════════════════════════════\n');
        console.log('1. Copy the environment variables above');
        console.log('2. Add them to your backend/.env file');
        console.log('3. Restart your backend server');
        console.log('4. Send a test email');
    } catch (error) {
        console.error('\n❌ Error getting tokens:', error.message);
        console.log('\nTroubleshooting:');
        console.log('- Make sure you copied the complete authorization code');
        console.log('- Check that your redirect URI matches: ' + REDIRECT_URI);
        console.log('- Verify your Client ID and Client Secret are correct');
    }
    rl.close();
});
