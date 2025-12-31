/**
 * Test script for Groq integration
 * Tests Groq service connectivity and basic functionality
 */

require('dotenv').config({ path: __dirname + '/.env' });

const groqService = require('./services/groqService');

async function testGroqIntegration() {
    console.log('\n🧪 Testing Groq Integration\n');
    console.log('='.repeat(60));

    // Test 1: Check if Groq is available
    console.log('\n1️⃣ Checking Groq availability...');
    const isAvailable = groqService.isAvailable();
    console.log(`   Groq Service Available: ${isAvailable ? '✅ YES' : '❌ NO'}`);

    if (!isAvailable) {
        console.log('\n❌ GROQ_API_KEY not configured or invalid.');
        console.log('💡 Please add GROQ_API_KEY to your .env file');
        process.exit(1);
    }

    // Test 2: Test connection
    console.log('\n2️⃣ Testing Groq connection...');
    try {
        const connectionTest = await groqService.testConnection();
        if (connectionTest.success) {
            console.log('   ✅ Connection successful!');
            console.log(`   Model: ${connectionTest.model}`);
            console.log(`   Response: "${connectionTest.message}"`);
        } else {
            console.log('   ❌ Connection failed:', connectionTest.message);
            process.exit(1);
        }
    } catch (error) {
        console.log('   ❌ Connection error:', error.message);
        process.exit(1);
    }

    // Test 3: Test property search response
    console.log('\n3️⃣ Testing property search response generation...');
    try {
        const mockProperties = [
            {
                _id: '507f1f77bcf86cd799439011',
                id: '507f1f77bcf86cd799439011',
                title: 'Luxury 3-Bedroom Apartment',
                location: 'Westlands, Nairobi',
                price: '150000',
                currency: 'KSh',
                priceType: 'rental',
                bedrooms: 3,
                bathrooms: 2,
                propertyType: 'apartment',
                amenities: ['Swimming Pool', 'Gym', 'Security'],
                description: 'Beautiful modern apartment with amazing city views'
            },
            {
                _id: '507f1f77bcf86cd799439012',
                id: '507f1f77bcf86cd799439012',
                title: 'Cozy 2-Bedroom Apartment',
                location: 'Kilimani, Nairobi',
                price: '80000',
                currency: 'KSh',
                priceType: 'rental',
                bedrooms: 2,
                bathrooms: 1,
                propertyType: 'apartment',
                amenities: ['Parking', 'Security'],
                description: 'Affordable and comfortable apartment in Kilimani'
            }
        ];

        const query = 'Show me rental apartments in Nairobi';
        const filters = {
            priceType: 'rental',
            propertyType: 'apartment',
            location: 'Nairobi'
        };

        console.log(`   Query: "${query}"`);
        console.log(`   Found ${mockProperties.length} properties`);

        const response = await groqService.generatePropertySearchResponse(query, mockProperties, filters);
        console.log('\n   ✅ AI Response:');
        console.log('   ' + '-'.repeat(56));
        console.log(`   ${response}`);
        console.log('   ' + '-'.repeat(56));

    } catch (error) {
        console.log('   ❌ Error generating response:', error.message);
        process.exit(1);
    }

    // Test 4: Test property details response
    console.log('\n4️⃣ Testing property details response...');
    try {
        const mockProperty = {
            title: 'Luxury 3-Bedroom Apartment',
            location: 'Westlands, Nairobi',
            price: '150000',
            currency: 'KSh',
            priceType: 'rental',
            bedrooms: 3,
            bathrooms: 2,
            propertyType: 'apartment',
            amenities: ['Swimming Pool', 'Gym', 'Security', '24/7 Water'],
            description: 'Beautiful modern apartment with amazing city views. Located in the heart of Westlands with easy access to shopping centers and restaurants.',
            squareFeet: 1500,
            yearBuilt: 2020
        };

        const response = await groqService.generatePropertyDetailsResponse(mockProperty);
        console.log('   ✅ AI Response:');
        console.log('   ' + '-'.repeat(56));
        console.log(`   ${response}`);
        console.log('   ' + '-'.repeat(56));

    } catch (error) {
        console.log('   ❌ Error generating details:', error.message);
        process.exit(1);
    }

    // Test 5: Test conversational response
    console.log('\n5️⃣ Testing conversational response...');
    try {
        const response = await groqService.generateConversationalResponse(
            'Hello! What kind of properties do you have?'
        );
        console.log('   ✅ AI Response:');
        console.log('   ' + '-'.repeat(56));
        console.log(`   ${response}`);
        console.log('   ' + '-'.repeat(56));

    } catch (error) {
        console.log('   ❌ Error generating conversation:', error.message);
        process.exit(1);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ All Groq integration tests passed successfully!');
    console.log('='.repeat(60) + '\n');

    console.log('📊 Summary:');
    console.log('   ✅ Groq service initialized');
    console.log('   ✅ Connection test passed');
    console.log('   ✅ Property search response working');
    console.log('   ✅ Property details response working');
    console.log('   ✅ Conversational response working');
    console.log('\n✨ Groq integration is ready to use!\n');
}

// Run tests
testGroqIntegration()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed with error:', error);
        process.exit(1);
    });
