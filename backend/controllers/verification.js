const DocumentVerification = require('../models/DocumentVerification');
const LandSearchRequest = require('../models/LandSearchRequest');
const ValuationRequest = require('../models/ValuationRequest');
const asyncHandler = require('express-async-handler');

// ==================== DOCUMENT VERIFICATION ====================

// @desc    Upload and verify document
// @route   POST /api/verification/documents
// @access  Private
exports.uploadDocument = asyncHandler(async (req, res) => {
    const { documentType } = req.body;

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a document' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const verification = await DocumentVerification.create({
        userId: req.user._id,
        documentType,
        fileName: req.file.originalname,
        fileUrl,
        status: 'pending',
    });

    res.status(201).json({ success: true, data: verification });
});

// @desc    Get user's document verifications
// @route   GET /api/verification/documents
// @access  Private
exports.getDocumentVerifications = asyncHandler(async (req, res) => {
    const verifications = await DocumentVerification.find({ userId: req.user._id })
        .sort('-createdAt');

    res.status(200).json({ success: true, count: verifications.length, data: verifications });
});

// @desc    Get single document verification
// @route   GET /api/verification/documents/:id
// @access  Private
exports.getDocumentVerification = asyncHandler(async (req, res) => {
    const verification = await DocumentVerification.findById(req.params.id);

    if (!verification) {
        return res.status(404).json({ success: false, message: 'Verification not found' });
    }

    if (verification.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: verification });
});

// ==================== LAND SEARCH ====================

// @desc    Create land search request
// @route   POST /api/verification/land-search
// @access  Private
exports.createLandSearchRequest = asyncHandler(async (req, res) => {
    const { parcelNumber, location } = req.body;

    if (!parcelNumber || !location) {
        return res.status(400).json({ success: false, message: 'Please provide parcel number and location' });
    }

    let documentUrl;
    if (req.file) {
        documentUrl = `/uploads/${req.file.filename}`;
    }

    const request = await LandSearchRequest.create({
        userId: req.user._id,
        parcelNumber,
        location,
        documentUrl,
        status: 'pending',
    });

    res.status(201).json({ success: true, data: request });
});

// @desc    Get user's land search requests
// @route   GET /api/verification/land-search
// @access  Private
exports.getLandSearchRequests = asyncHandler(async (req, res) => {
    const requests = await LandSearchRequest.find({ userId: req.user._id })
        .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Get single land search request
// @route   GET /api/verification/land-search/:id
// @access  Private
exports.getLandSearchRequest = asyncHandler(async (req, res) => {
    const request = await LandSearchRequest.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: request });
});

// ==================== VALUATION ====================

// @desc    Create valuation request
// @route   POST /api/verification/valuation
// @access  Private
exports.createValuationRequest = asyncHandler(async (req, res) => {
    const { propertyId, propertyDetails } = req.body;

    if (!propertyId && !propertyDetails) {
        return res.status(400).json({
            success: false,
            message: 'Please provide either propertyId or propertyDetails'
        });
    }

    let documentUrls = [];
    if (req.files && req.files.length > 0) {
        documentUrls = req.files.map(file => `/uploads/${req.file.filename}`);
    }

    const requestData = {
        userId: req.user._id,
        documentUrls,
        status: 'pending',
    };

    if (propertyId) {
        requestData.propertyId = propertyId;
    }

    if (propertyDetails) {
        requestData.propertyDetails = propertyDetails;
    }

    const request = await ValuationRequest.create(requestData);

    res.status(201).json({ success: true, data: request });
});

// @desc    Get user's valuation requests
// @route   GET /api/verification/valuation
// @access  Private
exports.getValuationRequests = asyncHandler(async (req, res) => {
    const requests = await ValuationRequest.find({ userId: req.user._id })
        .populate('propertyId', 'title location price')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Get single valuation request
// @route   GET /api/verification/valuation/:id
// @access  Private
exports.getValuationRequest = asyncHandler(async (req, res) => {
    const request = await ValuationRequest.findById(req.params.id)
        .populate('propertyId', 'title location price');

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: request });
});
