const SurveyTask = require('../models/SurveyTask');
const SurveyReport = require('../models/SurveyReport');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const emailService = require('../services/emailService');

// ==================== SURVEYOR REGISTRATION ====================

// @desc    Register a new surveyor
// @route   POST /api/surveyor/register
// @access  Public
exports.registerSurveyor = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, and password'
        });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long'
        });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., Test@123)'
        });
    }

    // Create user with Surveyor role
    user = new User({
        name,
        email,
        password,
        phone,
        role: 'Surveyor',
        isVerified: true
    });

    await user.save();

    res.status(201).json({
        success: true,
        message: 'Surveyor account created successfully. You can log in now.'
    });
});

// ==================== TASK MANAGEMENT ====================

// @desc    Get surveyor's assigned tasks
// @route   GET /api/surveyor/tasks
// @access  Private/Surveyor
exports.getSurveyorTasks = asyncHandler(async (req, res) => {
    const { status } = req.query;

    let query = {};

    // If surveyor, show assigned tasks
    if (req.user.role === 'Surveyor') {
        query = { assignedTo: req.user._id };
    }

    // Filter by status if provided
    if (status) {
        query.status = status;
    }

    const tasks = await SurveyTask.find(query)
        .populate('propertyId', 'title location imageUrls price')
        .populate('requestedBy', 'name email phone')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc    Get all pending tasks (for self-assignment)
// @route   GET /api/surveyor/tasks/pending
// @access  Private/Surveyor
exports.getPendingTasks = asyncHandler(async (req, res) => {
    const tasks = await SurveyTask.find({ status: 'pending', assignedTo: null })
        .populate('propertyId', 'title location imageUrls price')
        .populate('requestedBy', 'name email phone')
        .sort('-priority -createdAt');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc    Get specific task details
// @route   GET /api/surveyor/tasks/:id
// @access  Private/Surveyor
exports.getTask = asyncHandler(async (req, res) => {
    const task = await SurveyTask.findById(req.params.id)
        .populate('propertyId')
        .populate('requestedBy', 'name email phone')
        .populate('assignedTo', 'name email phone');

    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if surveyor is assigned to this task
    if (req.user.role === 'Surveyor' && task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to view this task' });
    }

    res.status(200).json({ success: true, data: task });
});

// @desc    Accept task (self-assignment)
// @route   PATCH /api/surveyor/tasks/:id/accept
// @access  Private/Surveyor
exports.acceptTask = asyncHandler(async (req, res) => {
    const task = await SurveyTask.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Task is not available for assignment' });
    }

    if (task.assignedTo) {
        return res.status(400).json({ success: false, message: 'Task already assigned' });
    }

    task.assignedTo = req.user._id;
    task.status = 'assigned';
    await task.save();

    const updatedTask = await SurveyTask.findById(task._id)
        .populate('propertyId', 'title location')
        .populate('requestedBy', 'name email');

    res.status(200).json({ success: true, data: updatedTask });
});

// @desc    Update task status
// @route   PATCH /api/surveyor/tasks/:id/status
// @access  Private/Surveyor
exports.updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const task = await SurveyTask.findById(req.params.id);

    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify surveyor is assigned to this task
    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    task.status = status;
    if (status === 'completed') {
        task.completedDate = Date.now();
    }
    await task.save();

    res.status(200).json({ success: true, data: task });
});

// ==================== REPORT MANAGEMENT ====================

// @desc    Upload survey report
// @route   POST /api/surveyor/reports
// @access  Private/Surveyor
exports.uploadReport = asyncHandler(async (req, res) => {
    const { taskId, findings, recommendations, latitude, longitude, accuracy } = req.body;

    if (!taskId || !findings || !latitude || !longitude) {
        return res.status(400).json({
            success: false,
            message: 'Task ID, findings, and GPS coordinates are required'
        });
    }

    // Verify task exists and is assigned to this surveyor
    const task = await SurveyTask.findById(taskId);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized for this task' });
    }

    // Collect uploaded files
    let reportFiles = [];
    let images = [];

    if (req.files) {
        req.files.forEach(file => {
            const fileUrl = `/uploads/${file.filename}`;
            if (file.mimetype === 'application/pdf') {
                reportFiles.push(fileUrl);
            } else {
                images.push(fileUrl);
            }
        });
    }

    // Create report
    const report = await SurveyReport.create({
        taskId,
        surveyorId: req.user._id,
        reportFiles,
        images,
        gpsCoordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: accuracy ? parseFloat(accuracy) : undefined,
        },
        findings,
        recommendations,
    });

    // Update task status to completed
    task.status = 'completed';
    task.completedDate = Date.now();
    await task.save();

    res.status(201).json({ success: true, data: report });
});

// @desc    Get report for task
// @route   GET /api/surveyor/reports/:taskId
// @access  Private
exports.getReportByTask = asyncHandler(async (req, res) => {
    const report = await SurveyReport.findOne({ taskId: req.params.taskId })
        .populate('surveyorId', 'name email');

    if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
});

// ==================== SURVEY REQUESTS (for agents/buyers) ====================

// @desc    Create survey request
// @route   POST /api/survey-requests
// @access  Private
exports.createSurveyRequest = asyncHandler(async (req, res) => {
    const { propertyId, requirements, priority, scheduledDate } = req.body;

    if (!propertyId) {
        return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    // Get property to extract location
    const Property = require('../models/Property');
    const property = await Property.findById(propertyId);

    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const task = await SurveyTask.create({
        propertyId,
        requestedBy: req.user._id,
        priority: priority || 'medium',
        scheduledDate,
        location: {
            address: property.location,
        },
        requirements,
    });

    const populatedTask = await SurveyTask.findById(task._id)
        .populate('propertyId', 'title location imageUrls')
        .populate('requestedBy', 'name email');

    res.status(201).json({ success: true, data: populatedTask });
});

// @desc    Get user's survey requests
// @route   GET /api/survey-requests
// @access  Private
exports.getUserSurveyRequests = asyncHandler(async (req, res) => {
    const requests = await SurveyTask.find({ requestedBy: req.user._id })
        .populate('propertyId', 'title location imageUrls')
        .populate('assignedTo', 'name email')
        .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Get specific survey request
// @route   GET /api/survey-requests/:id
// @access  Private
exports.getSurveyRequest = asyncHandler(async (req, res) => {
    const request = await SurveyTask.findById(req.params.id)
        .populate('propertyId')
        .populate('requestedBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify user is the requester
    if (request.requestedBy._id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: request });
});
