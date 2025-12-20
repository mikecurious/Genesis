const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    uploadDocument,
    getDocumentVerifications,
    getDocumentVerification,
    createLandSearchRequest,
    getLandSearchRequests,
    getLandSearchRequest,
    createValuationRequest,
    getValuationRequests,
    getValuationRequest,
} = require('../controllers/verification');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'verification-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        // Accept only PDF, JPG, PNG
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, and PNG files are allowed'));
        }
    }
});

// Document Verification Routes
router.route('/documents')
    .post(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), upload.single('document'), uploadDocument)
    .get(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), getDocumentVerifications);

router.route('/documents/:id')
    .get(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), getDocumentVerification);

// Land Search Routes
router.route('/land-search')
    .post(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), upload.single('document'), createLandSearchRequest)
    .get(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), getLandSearchRequests);

router.route('/land-search/:id')
    .get(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), getLandSearchRequest);

// Valuation Routes
router.route('/valuation')
    .post(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), upload.array('documents', 5), createValuationRequest)
    .get(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), getValuationRequests);

router.route('/valuation/:id')
    .get(protect, authorize('Agent', 'Property Seller', 'Property Owner', 'Admin'), getValuationRequest);

module.exports = router;
