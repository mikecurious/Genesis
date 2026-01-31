const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Property = require('../models/Property');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleProperties = [
    {
        title: "Luxurious 4-Bedroom Villa in Westlands",
        description: "Beautiful modern villa with spacious rooms, a private garden, swimming pool, and modern kitchen. Located in the heart of Westlands with easy access to shopping malls, restaurants, and business districts. Perfect for families looking for a premium living experience.",
        location: "Westlands, Nairobi",
        price: "85,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
        ],
        tags: ["luxury", "villa", "swimming pool", "garden", "modern"],
        status: "active",
        bedrooms: 4,
        bathrooms: 3,
        propertyType: "villa",
        amenities: ["pool", "garden", "gym", "parking", "security"],
        squareFeet: 3500,
        yearBuilt: 2022,
        semanticTags: ["family-friendly", "luxury", "prime-location"]
    },
    {
        title: "Cozy 2-Bedroom Apartment for Rent in Kilimani",
        description: "Modern 2-bedroom apartment with balcony, open-plan kitchen, and secure parking. Located in a quiet neighborhood with 24/7 security and backup generator. Close to supermarkets, hospitals, and public transport.",
        location: "Kilimani, Nairobi",
        price: "65,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
        ],
        tags: ["apartment", "modern", "balcony", "secure"],
        status: "active",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        amenities: ["parking", "security", "generator", "water"],
        squareFeet: 1200,
        yearBuilt: 2020
    },
    {
        title: "Spacious 3-Bedroom House in Karen",
        description: "Elegant family home featuring large living areas, a beautiful garden, and servant quarters. Located in the prestigious Karen estate with excellent schools nearby. Ideal for families seeking tranquility and space.",
        location: "Karen, Nairobi",
        price: "120,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
            "https://images.unsplash.com/photo-1572120360610-d971b9d7767c"
        ],
        tags: ["house", "garden", "family", "prestigious"],
        status: "active",
        bedrooms: 3,
        bathrooms: 3,
        propertyType: "house",
        amenities: ["garden", "parking", "security", "sq"],
        squareFeet: 2800,
        yearBuilt: 2019,
        semanticTags: ["family-friendly", "prime-location"]
    },
    {
        title: "Modern Studio Apartment in Upperhill",
        description: "Stylish studio apartment perfect for young professionals. Features contemporary design, high-speed internet, and is within walking distance to offices and restaurants. Fully furnished with modern appliances.",
        location: "Upperhill, Nairobi",
        price: "40,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1536376072261-38c75010e6c9"
        ],
        tags: ["studio", "modern", "furnished", "professional"],
        status: "active",
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "studio",
        amenities: ["wifi", "parking", "security"],
        squareFeet: 450,
        yearBuilt: 2021,
        semanticTags: ["starter-home", "modern-amenities"]
    },
    {
        title: "Commercial Office Space in CBD",
        description: "Prime commercial office space in Nairobi CBD. Modern building with elevator, backup power, and ample parking. Perfect for businesses looking for a central location with excellent infrastructure.",
        location: "Nairobi CBD",
        price: "180,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c"
        ],
        tags: ["commercial", "office", "CBD", "modern"],
        status: "active",
        bedrooms: 0,
        bathrooms: 2,
        propertyType: "commercial",
        amenities: ["elevator", "parking", "generator", "security"],
        squareFeet: 2000,
        yearBuilt: 2018
    },
    {
        title: "Affordable 1-Bedroom Apartment in Kasarani",
        description: "Budget-friendly apartment in a secure compound with water supply and parking. Great for first-time renters or small families. Near schools, hospitals, and shopping centers.",
        location: "Kasarani, Nairobi",
        price: "25,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb"
        ],
        tags: ["affordable", "1-bedroom", "secure"],
        status: "active",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "apartment",
        amenities: ["water", "parking", "security"],
        squareFeet: 600,
        yearBuilt: 2017,
        semanticTags: ["starter-home"]
    },
    {
        title: "Beachfront Villa in Mombasa",
        description: "Stunning beachfront property with direct ocean access, infinity pool, and breathtaking views. Perfect for vacation home or investment property. Fully furnished with luxury finishes.",
        location: "Nyali, Mombasa",
        price: "150,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227"
        ],
        tags: ["beachfront", "luxury", "vacation", "investment"],
        status: "active",
        bedrooms: 5,
        bathrooms: 4,
        propertyType: "villa",
        amenities: ["pool", "beach-access", "garden", "parking", "security"],
        squareFeet: 4500,
        yearBuilt: 2021,
        semanticTags: ["luxury", "family-friendly"]
    },
    {
        title: "Prime Land for Sale in Ngong",
        description: "1-acre plot with title deed in the rapidly developing Ngong area. Ideal for residential or commercial development. Good road access and utilities available.",
        location: "Ngong, Kajiado",
        price: "12,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef"
        ],
        tags: ["land", "investment", "title deed"],
        status: "active",
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        amenities: ["electricity", "water"],
        squareFeet: 43560,
        yearBuilt: null
    },
    {
        title: "Executive 3-Bedroom Townhouse in Lavington",
        description: "Contemporary townhouse in a gated community with clubhouse, gym, and children's play area. Features modern finishes, DSQ, and ample parking. Perfect for executives and growing families.",
        location: "Lavington, Nairobi",
        price: "95,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
        ],
        tags: ["townhouse", "executive", "gated-community"],
        status: "active",
        bedrooms: 3,
        bathrooms: 3,
        propertyType: "townhouse",
        amenities: ["gym", "playground", "parking", "security", "clubhouse"],
        squareFeet: 2200,
        yearBuilt: 2020,
        semanticTags: ["family-friendly", "modern-amenities"]
    },
    {
        title: "Penthouse Apartment with Panoramic Views",
        description: "Luxury penthouse on the 15th floor with stunning panoramic city views. Features include a rooftop terrace, jacuzzi, smart home system, and premium finishes throughout. Exclusive living at its finest.",
        location: "Westlands, Nairobi",
        price: "200,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
            "https://images.unsplash.com/photo-1574362848149-11496d93a7c7"
        ],
        tags: ["penthouse", "luxury", "panoramic views", "smart-home"],
        status: "active",
        bedrooms: 4,
        bathrooms: 4,
        propertyType: "condo",
        amenities: ["gym", "pool", "parking", "security", "elevator", "rooftop-terrace"],
        squareFeet: 3800,
        yearBuilt: 2023,
        semanticTags: ["luxury", "modern-amenities", "prime-location"]
    },
    {
        title: "Charming 2-Bedroom Bungalow in Runda",
        description: "Peaceful bungalow in the exclusive Runda estate. Features a lush garden, modern kitchen, and spacious living areas. Perfect for retirees or small families seeking serenity.",
        location: "Runda, Nairobi",
        price: "75,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
            "https://images.unsplash.com/photo-1576941089067-2de3c901e126"
        ],
        tags: ["bungalow", "garden", "peaceful", "exclusive"],
        status: "active",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "house",
        amenities: ["garden", "parking", "security", "water"],
        squareFeet: 1500,
        yearBuilt: 2015,
        semanticTags: ["family-friendly", "prime-location"]
    },
    {
        title: "Modern 4-Bedroom Maisonette in Syokimau",
        description: "Contemporary maisonette in a gated community near SGR station. Features include ensuite bedrooms, modern kitchen, DSQ, and private compound. Ideal for families working in the city.",
        location: "Syokimau, Machakos",
        price: "55,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
        ],
        tags: ["maisonette", "gated-community", "modern", "DSQ"],
        status: "active",
        bedrooms: 4,
        bathrooms: 3,
        propertyType: "townhouse",
        amenities: ["parking", "security", "water", "sq"],
        squareFeet: 2000,
        yearBuilt: 2019,
        semanticTags: ["family-friendly", "modern-amenities"]
    },
    {
        title: "Spacious 5-Bedroom Mansion in Muthaiga",
        description: "Grand mansion in prestigious Muthaiga with mature gardens, swimming pool, tennis court, and staff quarters. Features classic architecture with modern upgrades. Ultimate luxury living.",
        location: "Muthaiga, Nairobi",
        price: "350,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
        ],
        tags: ["mansion", "luxury", "pool", "tennis-court", "prestigious"],
        status: "active",
        bedrooms: 5,
        bathrooms: 6,
        propertyType: "villa",
        amenities: ["pool", "tennis-court", "garden", "gym", "parking", "security", "sq"],
        squareFeet: 6000,
        yearBuilt: 2010,
        semanticTags: ["luxury", "family-friendly", "prime-location"]
    },
    {
        title: "Budget-Friendly Bedsitter in Rongai",
        description: "Affordable bedsitter in a secure compound with reliable water supply. Perfect for students and young professionals starting out. Close to matatus and shopping centers.",
        location: "Rongai, Kajiado",
        price: "12,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
        ],
        tags: ["bedsitter", "affordable", "student-friendly"],
        status: "active",
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "studio",
        amenities: ["water", "security"],
        squareFeet: 300,
        yearBuilt: 2016,
        semanticTags: ["starter-home"]
    },
    {
        title: "Elegant 3-Bedroom Apartment in Kileleshwa",
        description: "Sophisticated apartment with open-plan living, modern finishes, and panoramic city views. Features include DSQ, ample storage, and secure parking. In a well-maintained building with backup generator.",
        location: "Kileleshwa, Nairobi",
        price: "85,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
        ],
        tags: ["apartment", "elegant", "city-views", "DSQ"],
        status: "active",
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        amenities: ["parking", "security", "generator", "elevator", "sq"],
        squareFeet: 1800,
        yearBuilt: 2018,
        semanticTags: ["family-friendly", "modern-amenities"]
    },
    {
        title: "Investment Apartments in Ruaka",
        description: "Brand new block of 12 units (2-bedroom apartments) ideal for rental income. High rental demand area with good infrastructure. Fully occupied with guaranteed returns.",
        location: "Ruaka, Kiambu",
        price: "180,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1460317442991-0ec209397118",
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"
        ],
        tags: ["investment", "apartments", "rental-income", "block"],
        status: "active",
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "commercial",
        amenities: ["parking", "security", "water", "generator"],
        squareFeet: 14400,
        yearBuilt: 2023,
        semanticTags: ["investment-opportunity"]
    },
    {
        title: "Lakeside Villa in Naivasha",
        description: "Stunning lakefront property with private boat dock, infinity pool, and panoramic lake views. Perfect vacation home or weekend retreat. Fully furnished with luxury amenities.",
        location: "Naivasha, Nakuru",
        price: "95,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d"
        ],
        tags: ["lakeside", "villa", "vacation", "boat-dock"],
        status: "active",
        bedrooms: 4,
        bathrooms: 3,
        propertyType: "villa",
        amenities: ["pool", "garden", "parking", "security", "boat-dock"],
        squareFeet: 3200,
        yearBuilt: 2020,
        semanticTags: ["luxury", "vacation-home"]
    },
    {
        title: "Commercial Warehouse in Industrial Area",
        description: "Large warehouse with high ceilings, loading bay, and office space. Ideal for manufacturing, storage, or distribution. Excellent road access and security.",
        location: "Industrial Area, Nairobi",
        price: "350,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
        ],
        tags: ["warehouse", "commercial", "industrial", "storage"],
        status: "active",
        bedrooms: 0,
        bathrooms: 2,
        propertyType: "commercial",
        amenities: ["parking", "security", "water", "electricity"],
        squareFeet: 8000,
        yearBuilt: 2015,
        semanticTags: ["investment-opportunity"]
    },
    {
        title: "Cozy Cottage in Limuru",
        description: "Charming cottage surrounded by tea farms and forests. Features a fireplace, large veranda, and organic garden. Perfect for nature lovers seeking tranquility.",
        location: "Limuru, Kiambu",
        price: "35,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf"
        ],
        tags: ["cottage", "nature", "fireplace", "garden"],
        status: "active",
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "house",
        amenities: ["garden", "parking", "water"],
        squareFeet: 1000,
        yearBuilt: 2005,
        semanticTags: ["family-friendly", "vacation-home"]
    },
    {
        title: "Luxury 3-Bedroom Apartment in Riverside",
        description: "Premium apartment in upscale Riverside with top-notch finishes, smart home features, and concierge service. Walking distance to malls and restaurants.",
        location: "Riverside, Nairobi",
        price: "120,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
        ],
        tags: ["luxury", "apartment", "smart-home", "riverside"],
        status: "active",
        bedrooms: 3,
        bathrooms: 3,
        propertyType: "apartment",
        amenities: ["gym", "pool", "parking", "security", "elevator", "concierge"],
        squareFeet: 2100,
        yearBuilt: 2022,
        semanticTags: ["luxury", "modern-amenities", "prime-location"]
    },
    {
        title: "Spacious Land in Kitengela",
        description: "5-acre plot with title deed along the Namanga Road. Ideal for residential or commercial development. Good access road and utilities nearby.",
        location: "Kitengela, Kajiado",
        price: "25,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef"
        ],
        tags: ["land", "acres", "title-deed", "investment"],
        status: "active",
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        amenities: ["electricity"],
        squareFeet: 217800,
        yearBuilt: null,
        semanticTags: ["investment-opportunity"]
    },
    {
        title: "Modern 2-Bedroom in Parklands",
        description: "Contemporary apartment in multicultural Parklands. Features include modern kitchen, balcony, and secure parking. Close to mosques, schools, and shopping centers.",
        location: "Parklands, Nairobi",
        price: "70,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        ],
        tags: ["apartment", "modern", "parklands", "balcony"],
        status: "active",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        amenities: ["parking", "security", "water", "generator"],
        squareFeet: 1100,
        yearBuilt: 2017,
        semanticTags: ["family-friendly", "modern-amenities"]
    },
    {
        title: "Executive Townhouse in Spring Valley",
        description: "Sophisticated townhouse in quiet Spring Valley. Features include master ensuite, modern kitchen, DSQ, and beautiful landscaping. Premium neighborhood with excellent security.",
        location: "Spring Valley, Nairobi",
        price: "65,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
        ],
        tags: ["townhouse", "executive", "spring-valley", "DSQ"],
        status: "active",
        bedrooms: 3,
        bathrooms: 3,
        propertyType: "townhouse",
        amenities: ["garden", "parking", "security", "sq"],
        squareFeet: 2400,
        yearBuilt: 2016,
        semanticTags: ["family-friendly", "prime-location"]
    },
    {
        title: "Affordable 3-Bedroom in Kahawa West",
        description: "Family-friendly apartment in well-maintained block. Features include ample living space, balcony, and dedicated parking. Near schools and shopping areas.",
        location: "Kahawa West, Nairobi",
        price: "45,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
        ],
        tags: ["affordable", "3-bedroom", "family", "kahawa"],
        status: "active",
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "apartment",
        amenities: ["parking", "security", "water"],
        squareFeet: 1300,
        yearBuilt: 2014,
        semanticTags: ["family-friendly", "starter-home"]
    },
    {
        title: "Retail Space in Thika Road Mall",
        description: "Prime retail space in busy Thika Road Mall. High foot traffic, excellent visibility, and ample customer parking. Perfect for retail business or restaurant.",
        location: "Thika Road, Nairobi",
        price: "200,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c"
        ],
        tags: ["retail", "commercial", "mall", "high-traffic"],
        status: "active",
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "commercial",
        amenities: ["parking", "security", "water", "electricity"],
        squareFeet: 1000,
        yearBuilt: 2018,
        semanticTags: ["investment-opportunity", "prime-location"]
    },
    {
        title: "4-Bedroom House with Pool in Nyari",
        description: "Beautiful family home in quiet Nyari estate. Features include swimming pool, large garden, modern kitchen, and DSQ. Close to international schools.",
        location: "Nyari, Nairobi",
        price: "90,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
        ],
        tags: ["house", "pool", "garden", "nyari"],
        status: "active",
        bedrooms: 4,
        bathrooms: 3,
        propertyType: "house",
        amenities: ["pool", "garden", "parking", "security", "sq"],
        squareFeet: 3000,
        yearBuilt: 2017,
        semanticTags: ["family-friendly", "prime-location"]
    },
    {
        title: "Student Bedsitter near Kenyatta University",
        description: "Convenient bedsitter walking distance from KU main gate. Secure compound with reliable water and electricity. Perfect for students.",
        location: "Kahawa, Nairobi",
        price: "10,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1536376072261-38c75010e6c9"
        ],
        tags: ["bedsitter", "student", "KU", "affordable"],
        status: "active",
        bedrooms: 0,
        bathrooms: 1,
        propertyType: "studio",
        amenities: ["water", "electricity", "security"],
        squareFeet: 250,
        yearBuilt: 2015,
        semanticTags: ["starter-home"]
    },
    {
        title: "Oceanfront Apartment in Diani",
        description: "Spectacular beachfront apartment with direct beach access, infinity pool, and ocean views. Fully furnished and managed. Perfect for holiday home or investment.",
        location: "Diani Beach, Kwale",
        price: "45,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d"
        ],
        tags: ["beachfront", "diani", "ocean-view", "pool"],
        status: "active",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "condo",
        amenities: ["pool", "beach-access", "parking", "security", "gym"],
        squareFeet: 1400,
        yearBuilt: 2021,
        semanticTags: ["luxury", "vacation-home"]
    },
    {
        title: "Agricultural Land in Nakuru",
        description: "50-acre farm with water access and fertile soil. Ideal for horticulture or dairy farming. Good road access and electric fence perimeter.",
        location: "Nakuru, Nakuru",
        price: "80,000,000 KSh",
        priceType: "sale",
        imageUrls: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef"
        ],
        tags: ["farm", "agricultural", "acres", "nakuru"],
        status: "active",
        bedrooms: 0,
        bathrooms: 0,
        propertyType: "land",
        amenities: ["water", "electricity"],
        squareFeet: 2178000,
        yearBuilt: null,
        semanticTags: ["investment-opportunity"]
    },
    {
        title: "Serviced Apartment in Westlands",
        description: "Fully furnished serviced apartment with hotel-like amenities. Includes housekeeping, gym, pool, and 24/7 concierge. Ideal for corporate rentals or short-term stays.",
        location: "Westlands, Nairobi",
        price: "150,000 KSh",
        priceType: "rental",
        imageUrls: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            "https://images.unsplash.com/photo-1574362848149-11496d93a7c7"
        ],
        tags: ["serviced", "furnished", "corporate", "westlands"],
        status: "active",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        amenities: ["gym", "pool", "parking", "security", "housekeeping", "concierge"],
        squareFeet: 1600,
        yearBuilt: 2022,
        semanticTags: ["luxury", "modern-amenities", "prime-location"]
    }
];

const seedDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();

        console.log('🗑️  Clearing existing properties...');
        await Property.deleteMany();

        console.log('👤 Finding or creating sample users for each role...');

        // Create sample users for different roles if they don't exist
        const roles = ['Agent', 'Property Seller', 'Landlord', 'Surveyor'];
        const users = {};

        for (const role of roles) {
            let user = await User.findOne({ role });

            if (!user) {
                user = await User.create({
                    name: `Sample ${role}`,
                    email: `${role.toLowerCase().replace(' ', '')}@example.com`,
                    password: 'password123',
                    role: role,
                    phone: '+254712345678',
                    isVerified: true
                });
                console.log(`✅ Created sample ${role}: ${user.email}`);
            } else {
                console.log(`✓ Found existing ${role}: ${user.email}`);
            }

            users[role] = user;
        }

        console.log('🏠 Creating sample properties...');

        // Assign properties to different users
        const propertiesWithUsers = sampleProperties.map((property, index) => {
            const roleIndex = index % roles.length;
            const role = roles[roleIndex];

            return {
                ...property,
                createdBy: users[role]._id
            };
        });

        const createdProperties = await Property.insertMany(propertiesWithUsers);

        console.log(`✅ Successfully created ${createdProperties.length} properties`);
        console.log('\n📊 Summary:');
        console.log(`   - Properties for sale: ${createdProperties.filter(p => p.priceType === 'sale').length}`);
        console.log(`   - Properties for rent: ${createdProperties.filter(p => p.priceType === 'rental').length}`);
        console.log(`   - Unique locations: ${[...new Set(createdProperties.map(p => p.location))].length}`);
        console.log('\n🎉 Database seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
