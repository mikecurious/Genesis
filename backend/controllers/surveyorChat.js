const surveyorMatchingService = require('../services/surveyorMatchingService');
const Property = require('../models/Property');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Parse chat message for surveyor intent
// @route   POST /api/surveyor-chat/parse
// @access  Private
exports.parseChatMessage = asyncHandler(async (req, res) => {
    const { message, propertyId } = req.body;

    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a message'
        });
    }

    // Parse intent
    const intent = await surveyorMatchingService.parseSurveyorIntent(message, req.user._id);

    if (!intent.isSurveyorRequest || intent.confidence < 60) {
        return res.status(200).json({
            success: true,
            data: {
                isSurveyorRequest: false,
                response: "I'm not sure if you're requesting a surveyor. Could you please clarify? For example: 'I need a surveyor for property inspection' or 'Find a valuer for my apartment'"
            }
        });
    }

    // Check if property is specified
    let property = null;
    if (propertyId) {
        property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check ownership
        if (property.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this property'
            });
        }
    } else if (!intent.propertyMentioned) {
        // Ask user to select a property
        const userProperties = await Property.find({ createdBy: req.user._id })
            .select('title location type')
            .limit(10);

        return res.status(200).json({
            success: true,
            data: {
                isSurveyorRequest: true,
                needsPropertySelection: true,
                intent,
                availableProperties: userProperties,
                response: "I understand you need a surveyor. Which property would you like to attach the surveyor to?"
            }
        });
    }

    // Find matching surveyors
    const criteria = {
        propertyType: property?.type || intent.extractedDetails?.propertyType,
        location: property?.location || intent.extractedDetails?.location,
        surveyType: intent.surveyType
    };

    const surveyors = await surveyorMatchingService.findMatchingSurveyors(criteria);

    if (surveyors.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                isSurveyorRequest: true,
                surveyors: [],
                response: "I couldn't find any surveyors matching your criteria. Would you like to broaden your search?"
            }
        });
    }

    // Get AI recommendation
    const recommendation = await surveyorMatchingService.getAIRecommendation(
        surveyors,
        property || {},
        intent.surveyType || 'general'
    );

    res.status(200).json({
        success: true,
        data: {
            isSurveyorRequest: true,
            intent,
            property: property ? {
                id: property._id,
                title: property.title,
                location: property.location,
                type: property.type
            } : null,
            surveyors,
            recommendation,
            response: property ?
                `I found ${surveyors.length} qualified ${intent.surveyType || 'general'} surveyor${surveyors.length > 1 ? 's' : ''} for your property "${property.title}". ${recommendation.reasoning}` :
                `I found ${surveyors.length} qualified surveyor${surveyors.length > 1 ? 's' : ''} matching your criteria.`
        }
    });
});

// @desc    Attach surveyor to property
// @route   POST /api/surveyor-chat/attach
// @access  Private
exports.attachSurveyor = asyncHandler(async (req, res) => {
    const { propertyId, surveyorId, surveyType } = req.body;

    if (!propertyId || !surveyorId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide property ID and surveyor ID'
        });
    }

    // Check property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    if (property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to modify this property'
        });
    }

    // Attach surveyor
    const result = await surveyorMatchingService.attachSurveyorToProperty(
        propertyId,
        surveyorId,
        surveyType || 'general'
    );

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.status(200).json({
        success: true,
        data: {
            property: result.property,
            surveyor: {
                id: result.surveyor._id,
                name: result.surveyor.name,
                email: result.surveyor.email,
                phone: result.surveyor.phone
            },
            response: `Successfully attached ${result.surveyor.name} to property "${property.title}". The surveyor will be notified.`
        },
        message: result.message
    });
});

// @desc    Get surveyor recommendations for a property
// @route   GET /api/surveyor-chat/recommend/:propertyId
// @access  Private
exports.getRecommendations = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { surveyType } = req.query;

    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this property'
        });
    }

    // Find matching surveyors
    const criteria = {
        propertyType: property.type,
        location: property.location,
        surveyType: surveyType || 'general'
    };

    const surveyors = await surveyorMatchingService.findMatchingSurveyors(criteria);

    if (surveyors.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                surveyors: [],
                message: 'No surveyors found matching your criteria'
            }
        });
    }

    // Get AI recommendation
    const recommendation = await surveyorMatchingService.getAIRecommendation(
        surveyors,
        property,
        surveyType || 'general'
    );

    res.status(200).json({
        success: true,
        data: {
            property: {
                id: property._id,
                title: property.title,
                location: property.location,
                type: property.type
            },
            surveyors,
            recommendation
        }
    });
});

// @desc    Get attached surveyor for a property
// @route   GET /api/surveyor-chat/attached/:propertyId
// @access  Private
exports.getAttachedSurveyor = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId)
        .populate('attachedSurveyor.surveyor', 'name email phone location surveyorProfile');

    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this property'
        });
    }

    if (!property.attachedSurveyor || !property.attachedSurveyor.surveyor) {
        return res.status(200).json({
            success: true,
            data: {
                hasAttachedSurveyor: false,
                message: 'No surveyor attached to this property'
            }
        });
    }

    res.status(200).json({
        success: true,
        data: {
            hasAttachedSurveyor: true,
            property: {
                id: property._id,
                title: property.title
            },
            attachedSurveyor: property.attachedSurveyor
        }
    });
});

// @desc    Update surveyor attachment status
// @route   PATCH /api/surveyor-chat/status/:propertyId
// @access  Private
exports.updateSurveyorStatus = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { status, scheduledDate, notes } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found'
        });
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to modify this property'
        });
    }

    if (!property.attachedSurveyor || !property.attachedSurveyor.surveyor) {
        return res.status(400).json({
            success: false,
            message: 'No surveyor attached to this property'
        });
    }

    // Update status
    if (status) {
        const validStatuses = ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        property.attachedSurveyor.status = status;

        if (status === 'completed') {
            property.attachedSurveyor.completedDate = new Date();
        }
    }

    if (scheduledDate) {
        property.attachedSurveyor.scheduledDate = new Date(scheduledDate);
        if (property.attachedSurveyor.status === 'pending') {
            property.attachedSurveyor.status = 'scheduled';
        }
    }

    if (notes) {
        property.attachedSurveyor.notes = notes;
    }

    await property.save();

    res.status(200).json({
        success: true,
        data: property.attachedSurveyor,
        message: 'Surveyor status updated successfully'
    });
});
