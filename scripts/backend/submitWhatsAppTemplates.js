/**
 * Script to Submit WhatsApp Message Templates to Meta via Twilio
 *
 * This script helps you submit message templates programmatically using the Twilio Content API.
 *
 * Usage:
 *   node backend/scripts/submitWhatsAppTemplates.js
 *
 * Prerequisites:
 *   - TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env
 *   - Templates defined in backend/config/whatsappTemplates.js
 *
 * Note: After submission, templates must be approved by Meta before use.
 *       Approval typically takes 1-2 business days.
 */

require('dotenv').config();
const twilio = require('twilio');
const whatsappTemplates = require('../config/whatsappTemplates');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error('❌ Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

/**
 * Submit a single template to Twilio/WhatsApp for approval
 */
async function submitTemplate(templateKey, template) {
    try {
        console.log(`\n📤 Submitting template: ${template.name}...`);

        // Create content template via Twilio API
        const contentTemplate = await client.content.contents.create({
            friendlyName: template.name,
            language: template.language,
            variables: Object.keys(template.example.variables).reduce((acc, idx) => {
                acc[parseInt(idx) + 1] = template.example.variables[idx];
                return acc;
            }, {}),
            types: {
                'twilio/text': {
                    body: template.body
                }
            }
        });

        console.log(`✅ Template submitted successfully!`);
        console.log(`   SID: ${contentTemplate.sid}`);
        console.log(`   Status: ${contentTemplate.approvalRequests ? 'Pending Approval' : 'Created'}`);
        console.log(`   Add this to your .env:`);
        console.log(`   WHATSAPP_TEMPLATE_${templateKey}=${contentTemplate.sid}`);

        return {
            key: templateKey,
            sid: contentTemplate.sid,
            success: true
        };
    } catch (error) {
        console.error(`❌ Failed to submit template ${template.name}:`);
        console.error(`   Error: ${error.message}`);

        return {
            key: templateKey,
            error: error.message,
            success: false
        };
    }
}

/**
 * Submit all templates
 */
async function submitAllTemplates() {
    console.log('🚀 WhatsApp Template Submission Tool\n');
    console.log('This will submit all message templates to Meta for approval.\n');

    const results = [];

    for (const [key, template] of Object.entries(whatsappTemplates)) {
        const result = await submitTemplate(key, template);
        results.push(result);

        // Wait a bit between submissions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUBMISSION SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
    if (failed.length > 0) {
        console.log(`❌ Failed: ${failed.length}/${results.length}`);
        console.log('\nFailed templates:');
        failed.forEach(f => console.log(`   - ${f.key}: ${f.error}`));
    }

    if (successful.length > 0) {
        console.log('\n📝 Add these to your .env file:\n');
        successful.forEach(s => {
            console.log(`WHATSAPP_TEMPLATE_${s.key}=${s.sid}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('⏳ NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('1. Templates are now submitted for Meta approval');
    console.log('2. Check approval status in Twilio Console:');
    console.log('   https://console.twilio.com/us1/develop/sms/content-editor');
    console.log('3. Approval typically takes 1-2 business days');
    console.log('4. Once approved, add the SIDs to your .env file');
    console.log('5. Use the template manager service to send template messages');
    console.log('='.repeat(60) + '\n');
}

// Alternative: Submit templates using WhatsApp Business API format
async function submitTemplateWhatsAppFormat(templateKey, template) {
    try {
        console.log(`\n📤 Submitting WhatsApp template: ${template.name}...`);

        // Format for WhatsApp Business API
        const whatsappTemplate = {
            name: template.name,
            language: template.language,
            category: template.category,
            components: [
                {
                    type: 'BODY',
                    text: template.body
                }
            ]
        };

        // Note: For direct WhatsApp API submission, you would use:
        // POST https://graph.facebook.com/v17.0/{whatsapp-business-account-id}/message_templates

        console.log('📋 WhatsApp Template Format:');
        console.log(JSON.stringify(whatsappTemplate, null, 2));

        console.log('\n💡 To submit directly to Meta:');
        console.log('1. Go to: https://business.facebook.com/wa/manage/message-templates/');
        console.log('2. Select your WhatsApp Business Account');
        console.log('3. Create new template using the format above');

        return { success: true, key: templateKey };
    } catch (error) {
        console.error(`❌ Error formatting template: ${error.message}`);
        return { success: false, key: templateKey, error: error.message };
    }
}

/**
 * Display templates without submitting (dry run)
 */
function displayTemplates() {
    console.log('📋 WhatsApp Message Templates\n');
    console.log('='.repeat(60));

    Object.entries(whatsappTemplates).forEach(([key, template]) => {
        console.log(`\n📄 ${key}`);
        console.log('-'.repeat(60));
        console.log(`Name: ${template.name}`);
        console.log(`Category: ${template.category}`);
        console.log(`Language: ${template.language}`);
        console.log('\nTemplate Body:');
        console.log(template.body);
        console.log('\nExample Variables:');
        template.example.variables.forEach((v, i) => {
            console.log(`   {{${i + 1}}}: ${v}`);
        });
        console.log('-'.repeat(60));
    });

    console.log('\n💡 Run with --submit flag to submit templates to Meta');
    console.log('   Example: node backend/scripts/submitWhatsAppTemplates.js --submit\n');
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--submit')) {
    submitAllTemplates().catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
} else if (args.includes('--whatsapp-format')) {
    console.log('Displaying WhatsApp Business API format...\n');
    Object.entries(whatsappTemplates).forEach(([key, template]) => {
        submitTemplateWhatsAppFormat(key, template);
    });
} else {
    displayTemplates();
}
