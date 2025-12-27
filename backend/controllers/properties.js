
const Property = require('../models/Property');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    // Add location search with word boundary matching for more precise results
    let filter = JSON.parse(queryStr);

    if (req.query.location) {
        // Use word boundary regex to match the location as a complete word
        // This prevents matching "Nairobi" in "Nairobi Road, Mombasa" when searching for Nairobi
        // But still matches "Nairobi" in "Westlands, Nairobi" or just "Nairobi"
        const locationPattern = req.query.location
            .split(',')
            .map(loc => loc.trim())
            .filter(loc => loc.length > 0)
            .map(loc => `\\b${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
            .join('|');

        filter.location = { $regex: locationPattern, $options: 'i' };
    }

    // Filter by specific user if provided
    if (req.query.userId) {
        filter.createdBy = req.query.userId;
    }

    query = Property.find(filter).populate('createdBy', 'name email');

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Executing query with lean for better performance (read-only)
    const properties = await query.lean();

    res.status(200).json({ success: true, count: properties.length, data: properties });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
    const property = await Property.findById(req.params.id).populate('createdBy', 'name email').lean();
    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.status(200).json({ success: true, data: property });
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Agents, Property Sellers, Landlords, Admin)
exports.createProperty = asyncHandler(async (req, res, next) => {
    const { title, description, location, price, priceType, tags } = req.body;

    // Role-based priceType validation
    const userRole = req.user.role;
    let finalPriceType = priceType;

    if (userRole === 'Property Seller') {
        // Property Sellers can only create sale listings
        if (priceType && priceType !== 'sale') {
            return res.status(403).json({
                success: false,
                message: 'Property Sellers can only create sale listings'
            });
        }
        finalPriceType = 'sale';
    } else if (userRole === 'Landlord') {
        // Landlords can only create rental listings
        if (priceType && priceType !== 'rental') {
            return res.status(403).json({
                success: false,
                message: 'Landlords can only create rental listings'
            });
        }
        finalPriceType = 'rental';
    } else if (userRole === 'Agent') {
        // Agents can create both types
        if (!priceType) {
            return res.status(400).json({
                success: false,
                message: 'Please specify priceType (sale or rental)'
            });
        }
        finalPriceType = priceType;
    }

    // Debug logging
    console.log('=== CREATE PROPERTY DEBUG ===');
    console.log('Request Headers content-type:', req.headers['content-type']);
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    console.log('=============================');

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else {
        return res.status(400).json({ success: false, message: 'Please upload at least one image.' });
    }

    const propertyData = {
        title,
        description,
        location,
        price,
        priceType: finalPriceType,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
        imageUrls,
        createdBy: req.user._id
    };

    const property = await Property.create(propertyData);
    const populatedProperty = await Property.findById(property._id).populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: populatedProperty });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = asyncHandler(async (req, res, next) => {
    let property = await Property.findById(req.params.id);
    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is the property owner or admin
    if (property.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    // Role-based priceType validation for updates
    if (req.body.priceType) {
        const userRole = req.user.role;
        if (userRole === 'Property Seller' && req.body.priceType !== 'sale') {
            return res.status(403).json({
                success: false,
                message: 'Property Sellers can only have sale listings'
            });
        } else if (userRole === 'Landlord' && req.body.priceType !== 'rental') {
            return res.status(403).json({
                success: false,
                message: 'Landlords can only have rental listings'
            });
        }
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: property });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = asyncHandler(async (req, res, next) => {
    const property = await Property.findById(req.params.id);
    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Debug logging
    console.log('=== DELETE PROPERTY DEBUG ===');
    console.log('Property ID:', req.params.id);
    console.log('Property createdBy:', property.createdBy);
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('createdBy type:', typeof property.createdBy);
    console.log('user._id type:', typeof req.user._id);
    console.log('Match:', property.createdBy && property.createdBy.toString() === req.user._id.toString());
    console.log('============================');

    // Check if property has a valid createdBy
    if (!property.createdBy) {
        return res.status(400).json({
            success: false,
            message: 'This property has no owner assigned. Please contact support or run the database fix script.'
        });
    }

    if (property.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();
    res.status(200).json({ success: true, data: {} });
});

// @desc    Boost a property
// @route   PUT /api/properties/:id/boost
// @access  Private
exports.boostProperty = asyncHandler(async (req, res, next) => {
    const property = await Property.findByIdAndUpdate(req.params.id, { boosted: true }, {
        new: true,
        runValidators: true,
    }).populate('createdBy', 'name email');

    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Here you could integrate with a payment check or plan feature check
    console.log(`ADMIN NOTIFICATION: Property ${property.title} has been boosted.`);

    res.status(200).json({ success: true, data: property });
});
