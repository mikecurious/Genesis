const ServiceProvider = require('../models/ServiceProvider');
const asyncHandler = require('express-async-handler');

// @desc    Get all service providers
// @route   GET /api/providers
// @access  Private
exports.getProviders = asyncHandler(async (req, res) => {
    const { specialty, availability, status } = req.query;

    const filter = {};

    // Build filter based on query parameters
    if (specialty) filter.specialty = specialty;
    if (availability) filter.availability = availability;
    if (status) filter.status = status;

    // Agents can only see their own providers, admins can see all
    if (req.user.role !== 'Admin') {
        filter.addedBy = req.user._id;
    }

    const providers = await ServiceProvider.find(filter)
        .populate('addedBy', 'name email')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: providers.length,
        data: providers
    });
});

// @desc    Get single service provider
// @route   GET /api/providers/:id
// @access  Private
exports.getProvider = asyncHandler(async (req, res) => {
    const provider = await ServiceProvider.findById(req.params.id)
        .populate('addedBy', 'name email')
        .populate('reviews.user', 'name');

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    // Check if user has access to this provider (handle populated addedBy)
    const addedById = provider.addedBy?._id ? provider.addedBy._id.toString() : provider.addedBy.toString();
    if (req.user.role !== 'Admin' && addedById !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this provider'
        });
    }

    res.status(200).json({
        success: true,
        data: provider
    });
});

// @desc    Create new service provider
// @route   POST /api/providers
// @access  Private (Agent, Admin)
exports.createProvider = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        specialty,
        yearsOfExperience,
        certifications,
        serviceArea,
        hourlyRate,
        description,
        companyName
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !specialty) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, phone, and specialty'
        });
    }

    // Check if provider with same email already exists for this user
    const existingProvider = await ServiceProvider.findOne({
        email,
        addedBy: req.user._id
    });

    if (existingProvider) {
        return res.status(400).json({
            success: false,
            message: 'You already have a provider with this email'
        });
    }

    // Create provider
    const provider = await ServiceProvider.create({
        name,
        email,
        phone,
        specialty,
        yearsOfExperience: yearsOfExperience || 0,
        certifications: certifications || [],
        serviceArea: serviceArea || '',
        hourlyRate: hourlyRate || 0,
        description: description || '',
        companyName: companyName || '',
        addedBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Service provider added successfully',
        data: provider
    });
});

// @desc    Update service provider
// @route   PUT /api/providers/:id
// @access  Private
exports.updateProvider = asyncHandler(async (req, res) => {
    let provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    // Check if user has access to update this provider
    if (req.user.role !== 'Admin' && provider.addedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this provider'
        });
    }

    // Update provider
    provider = await ServiceProvider.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: 'Provider updated successfully',
        data: provider
    });
});

// @desc    Delete service provider
// @route   DELETE /api/providers/:id
// @access  Private
exports.deleteProvider = asyncHandler(async (req, res) => {
    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    // Check if user has access to delete this provider
    if (req.user.role !== 'Admin' && provider.addedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this provider'
        });
    }

    await ServiceProvider.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Provider deleted successfully'
    });
});

// @desc    Add review to service provider
// @route   POST /api/providers/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid rating (1-5)'
        });
    }

    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    // Check if user already reviewed this provider
    const existingReview = provider.reviews.find(
        review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: 'You have already reviewed this provider'
        });
    }

    // Add review
    provider.reviews.push({
        user: req.user._id,
        rating,
        comment: comment || ''
    });

    // Recalculate average rating
    provider.calculateAverageRating();

    await provider.save();

    res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: provider
    });
});

// @desc    Update provider availability
// @route   PATCH /api/providers/:id/availability
// @access  Private
exports.updateAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body;

    if (!['Available', 'Busy', 'Inactive'].includes(availability)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid availability status'
        });
    }

    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    // Check if user has access
    if (req.user.role !== 'Admin' && provider.addedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this provider'
        });
    }

    provider.availability = availability;
    await provider.save();

    res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: provider
    });
});

// @desc    Get provider statistics
// @route   GET /api/providers/stats
// @access  Private
exports.getProviderStats = asyncHandler(async (req, res) => {
    const filter = req.user.role === 'Admin' ? {} : { addedBy: req.user._id };

    const stats = await ServiceProvider.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalProviders: { $sum: 1 },
                availableProviders: {
                    $sum: { $cond: [{ $eq: ['$availability', 'Available'] }, 1, 0] }
                },
                averageRating: { $avg: '$rating' },
                totalCompletedJobs: { $sum: '$completedJobs' }
            }
        }
    ]);

    const specialtyBreakdown = await ServiceProvider.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$specialty',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            summary: stats[0] || {
                totalProviders: 0,
                availableProviders: 0,
                averageRating: 0,
                totalCompletedJobs: 0
            },
            specialtyBreakdown
        }
    });
});
