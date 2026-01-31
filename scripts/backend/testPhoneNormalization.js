/**
 * Test Phone Number Normalization
 */

function normalizePhoneNumber(phone) {
    // Remove all non-numeric characters (including + sign)
    return phone.replace(/\D/g, '');
}

function validatePhoneNumber(phone) {
    const normalized = normalizePhoneNumber(phone);
    return /^254\d{9}$/.test(normalized);
}

const testCases = [
    // Valid formats
    { input: '254712345678', expected: true, desc: 'Standard format' },
    { input: '+254712345678', expected: true, desc: 'With + prefix' },
    { input: '0712345678', expected: false, desc: 'Kenyan format (needs conversion)' },
    { input: '254 712 345 678', expected: true, desc: 'With spaces' },
    { input: '+254-712-345-678', expected: true, desc: 'With + and dashes' },
    { input: '(254) 712 345 678', expected: true, desc: 'With parentheses' },

    // Invalid formats
    { input: '712345678', expected: false, desc: 'Missing country code' },
    { input: '254712', expected: false, desc: 'Too short' },
    { input: '25471234567890', expected: false, desc: 'Too long' },
    { input: '255712345678', expected: false, desc: 'Wrong country code (Tanzania)' },
];

console.log('📱 Phone Number Normalization Test\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
    const normalized = normalizePhoneNumber(testCase.input);
    const isValid = validatePhoneNumber(testCase.input);
    const passed = isValid === testCase.expected;

    console.log(`\n${index + 1}. ${testCase.desc}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Normalized: "${normalized}"`);
    console.log(`   Valid: ${isValid} (expected: ${testCase.expected})`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(60));

// Test the specific case from the demo agent
const demoAgentPhone = '+254712345678';
console.log(`\n🧪 Demo Agent Phone Test:`);
console.log(`   Input: "${demoAgentPhone}"`);
console.log(`   Normalized: "${normalizePhoneNumber(demoAgentPhone)}"`);
console.log(`   Valid: ${validatePhoneNumber(demoAgentPhone) ? '✅ YES' : '❌ NO'}`);
console.log('');
