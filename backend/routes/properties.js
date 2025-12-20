
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    boostProperty,
} = require('../controllers/properties');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Public route to get all properties
router.route('/').get(getProperties);

// Public route to get a single property
router.route('/:id').get(getProperty);

// Protected routes for agents/owners
router.route('/')
    .post(protect, authorize('Agent', 'Property Seller', 'Landlord', 'Admin'), upload.array('imageUrls', 5), createProperty);

router.route('/:id')
    .put(protect, authorize('Agent', 'Property Seller', 'Landlord', 'Admin'), updateProperty)
    .delete(protect, authorize('Agent', 'Property Seller', 'Landlord', 'Admin'), deleteProperty);

router.route('/:id/boost')
    .put(protect, authorize('Agent', 'Property Seller', 'Landlord', 'Admin'), boostProperty);

module.exports = router;
