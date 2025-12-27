require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User');

console.log('🏠 Creating Test Property in Nairobi...\n');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Find an agent to assign the property to
    const agent = await User.findOne({ role: 'Agent' });
    
    if (!agent) {
        console.log('❌ No agent found in database');
        console.log('Creating with first available user...');
    }

    const userId = agent ? agent._id : await User.findOne().then(u => u._id);

    const testProperty = new Property({
        title: 'Test Property - Nairobi CBD',
        description: 'Beautiful test property in the heart of Nairobi CBD. Perfect for testing M-Pesa payments! This is a demo listing with a symbolic price of 10 KES for testing purposes.',
        location: 'Nairobi CBD, Nairobi',
        price: '10',
        priceType: 'rental',
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        area: '850',
        amenities: ['Parking', 'Security', 'Water', 'Electricity'],
        images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
        ],
        createdBy: userId,
        status: 'active',
        isPromoted: false,
    });

    await testProperty.save();

    console.log('✅ Test Property Created Successfully!\n');
    console.log('📋 Property Details:');
    console.log('Title:', testProperty.title);
    console.log('Location:', testProperty.location);
    console.log('Price: KES', testProperty.price);
    console.log('Type:', testProperty.priceType);
    console.log('Property ID:', testProperty._id);
    console.log('Created By:', userId);
    console.log('\n💡 You can now test payments with this property!');

    mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
