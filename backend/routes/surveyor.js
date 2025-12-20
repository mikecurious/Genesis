const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getSurveyorTasks,
    getPendingTasks,
    getTask,
    acceptTask,
    updateTaskStatus,
    uploadReport,
    getReportByTask,
    createSurveyRequest,
    getUserSurveyRequests,
    getSurveyRequest,
} = require('../controllers/surveyor');
const {
    getSurveyorProfile,
    updateSurveyorProfile,
    uploadProfileImage,
    getAvailableSurveyors,
    searchSurveyors
} = require('../controllers/surveyorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'survey-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for survey reports
    fileFilter: function (req, file, cb) {
        // Accept PDF, images
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

// ==================== SURVEYOR ROUTES ====================

// Task Management (Surveyor only)
router.route('/tasks')
    .get(protect, authorize('Surveyor'), getSurveyorTasks);

router.route('/tasks/pending')
    .get(protect, authorize('Surveyor'), getPendingTasks);

router.route('/tasks/:id')
    .get(protect, authorize('Surveyor'), getTask);

router.route('/tasks/:id/accept')
    .patch(protect, authorize('Surveyor'), acceptTask);

router.route('/tasks/:id/status')
    .patch(protect, authorize('Surveyor'), updateTaskStatus);

// Report Management (Surveyor only)
router.route('/reports')
    .post(protect, authorize('Surveyor'), upload.array('files', 10), uploadReport);

router.route('/reports/:taskId')
    .get(protect, getReportByTask);

// ==================== PROFILE MANAGEMENT ROUTES ====================

// Profile Management (Surveyor only)
router.route('/profile')
    .get(protect, authorize('Surveyor'), getSurveyorProfile)
    .put(protect, authorize('Surveyor'), updateSurveyorProfile);

router.route('/upload-image')
    .post(protect, authorize('Surveyor'), ...uploadProfileImage);

// Surveyor Search & Listing (Public)
router.route('/available')
    .get(getAvailableSurveyors);

router.route('/search')
    .post(searchSurveyors);

// ==================== SURVEY REQUEST ROUTES (for agents/buyers) ====================

// These routes are in a separate file to keep surveyor routes clean
// They will be mounted at /api/survey-requests in server.js

module.exports = router;
