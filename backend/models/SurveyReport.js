const mongoose = require('mongoose');

const SurveyReportSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.ObjectId,
        ref: 'SurveyTask',
        required: [true, 'Task ID is required'],
    },
    surveyorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Surveyor ID is required'],
    },
    reportFiles: [String], // URLs to PDF reports
    images: [String], // URLs to images
    gpsCoordinates: {
        latitude: {
            type: Number,
            required: [true, 'GPS latitude is required'],
        },
        longitude: {
            type: Number,
            required: [true, 'GPS longitude is required'],
        },
        accuracy: Number,
    },
    findings: {
        type: String,
        required: [true, 'Survey findings are required'],
    },
    recommendations: String,
    aiValidation: {
        isValid: {
            type: Boolean,
            default: false,
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
        },
        issues: [String],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
SurveyReportSchema.index({ taskId: 1 });
SurveyReportSchema.index({ surveyorId: 1, uploadedAt: -1 });

module.exports = mongoose.model('SurveyReport', SurveyReportSchema);
