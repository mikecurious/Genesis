const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Verify MongoDB URI is loaded
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
    console.error('❌ MONGODB_URI or MONGO_URI not found in environment variables');
    console.log('Make sure .env file exists at:', path.join(__dirname, '..', '.env'));
    process.exit(1);
}

const User = require('../models/User');

async function createDummySurveyor() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if surveyor already exists
        const existingSurveyor = await User.findOne({ email: 'surveyor@test.com' });
        if (existingSurveyor) {
            console.log('ℹ️  Test surveyor already exists');
            console.log('📧 Email: surveyor@test.com');
            console.log('🔑 Password: Surveyor123!');
            process.exit(0);
        }

        // Create test surveyor
        const surveyor = await User.create({
            name: 'John Kamau',
            email: 'surveyor@test.com',
            phone: '+254712345678',
            password: 'Surveyor123!',
            role: 'Surveyor',
            isVerified: true,
            accountStatus: 'active',
            surveyorProfile: {
                location: 'Nairobi',
                specializations: ['Residential', 'Commercial', 'Land'],
                yearsOfExperience: 8,
                certifications: [
                    'Licensed Land Surveyor',
                    'Registered Quantity Surveyor',
                    'RICS Certified'
                ],
                rating: 4.8,
                completedSurveys: 148,
                availability: 'Available',
                bio: 'Experienced surveyor specializing in residential, commercial, and land surveys. Over 8 years of professional experience in Nairobi and surrounding areas.',
                services: [
                    {
                        name: 'Property Valuation',
                        description: 'Professional property valuation for residential and commercial properties',
                        price: 15000
                    },
                    {
                        name: 'Land Survey',
                        description: 'Comprehensive land surveying and boundary marking',
                        price: 25000
                    },
                    {
                        name: 'Building Inspection',
                        description: 'Detailed building inspection and compliance checking',
                        price: 12000
                    }
                ]
            }
        });

        console.log('✅ Test surveyor created successfully!');
        console.log('');
        console.log('📋 Surveyor Details:');
        console.log('   Name: John Kamau');
        console.log('   Email: surveyor@test.com');
        console.log('   Password: Surveyor123!');
        console.log('   Location: Nairobi');
        console.log('   Specializations: Residential, Commercial, Land');
        console.log('   Experience: 8 years');
        console.log('   Rating: 4.8/5');
        console.log('   Availability: Available');
        console.log('');
        console.log('💡 You can now test surveyor matching by typing:');
        console.log('   "I need a surveyor"');
        console.log('   "Find a valuer for my property"');
        console.log('   "Attach a surveyor to this building"');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating surveyor:', error);
        process.exit(1);
    }
}

createDummySurveyor();
