const financialReportingService = require('../services/financialReportingService');
const FinancialReport = require('../models/FinancialReport');
const asyncHandler = require('express-async-handler');

// @desc    Generate financial report for current month
// @route   POST /api/financial-reports/generate
// @access  Private (Landlord/Agent/Admin)
exports.generateReport = asyncHandler(async (req, res) => {
    const { month, year } = req.body;

    // Default to current month if not provided
    const reportMonth = month || new Date().getMonth() + 1;
    const reportYear = year || new Date().getFullYear();

    const report = await financialReportingService.generateReport(
        req.user._id,
        reportMonth,
        reportYear
    );

    res.status(200).json({
        success: true,
        data: report,
        message: 'Financial report generated successfully'
    });
});

// @desc    Get all financial reports for landlord
// @route   GET /api/financial-reports
// @access  Private (Landlord/Agent/Admin)
exports.getReports = asyncHandler(async (req, res) => {
    const { year, limit = 12 } = req.query;

    const query = { landlord: req.user._id };

    if (year) {
        query['period.year'] = parseInt(year);
    }

    const reports = await FinancialReport.find(query)
        .sort({ 'period.year': -1, 'period.month': -1 })
        .limit(parseInt(limit))
        .populate('landlord', 'name email')
        .populate('propertyBreakdown.property', 'title location');

    res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
    });
});

// @desc    Get single financial report
// @route   GET /api/financial-reports/:id
// @access  Private
exports.getReport = asyncHandler(async (req, res) => {
    const report = await FinancialReport.findById(req.params.id)
        .populate('landlord', 'name email')
        .populate('propertyBreakdown.property', 'title location');

    if (!report) {
        return res.status(404).json({
            success: false,
            message: 'Report not found'
        });
    }

    // Check ownership
    if (report.landlord._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this report'
        });
    }

    res.status(200).json({
        success: true,
        data: report
    });
});

// @desc    Export financial report to Excel
// @route   GET /api/financial-reports/:id/export
// @access  Private
exports.exportReport = asyncHandler(async (req, res) => {
    const report = await FinancialReport.findById(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: 'Report not found'
        });
    }

    // Check ownership
    if (report.landlord.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to export this report'
        });
    }

    const workbook = await financialReportingService.exportToExcel(req.params.id);

    // Set response headers for Excel file
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=financial-report-${report.period.month}-${report.period.year}.xlsx`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
});

// @desc    Get financial dashboard summary
// @route   GET /api/financial-reports/dashboard/summary
// @access  Private (Landlord/Agent/Admin)
exports.getDashboardSummary = asyncHandler(async (req, res) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get current month report
    let currentReport = await FinancialReport.findOne({
        landlord: req.user._id,
        'period.month': currentMonth,
        'period.year': currentYear
    });

    // If no report exists, generate one
    if (!currentReport) {
        currentReport = await financialReportingService.generateReport(
            req.user._id,
            currentMonth,
            currentYear
        );
    }

    // Get previous month for comparison
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const previousReport = await FinancialReport.findOne({
        landlord: req.user._id,
        'period.month': prevMonth,
        'period.year': prevYear
    });

    // Calculate month-over-month changes
    const changes = {
        income: 0,
        expenses: 0,
        netIncome: 0,
        occupancyRate: 0,
        collectionRate: 0
    };

    if (previousReport) {
        changes.income = currentReport.income.total - previousReport.income.total;
        changes.expenses = currentReport.expenses.total - previousReport.expenses.total;
        changes.netIncome = currentReport.metrics.netIncome - previousReport.metrics.netIncome;
        changes.occupancyRate = currentReport.metrics.occupancyRate - previousReport.metrics.occupancyRate;
        changes.collectionRate = currentReport.metrics.collectionRate - previousReport.metrics.collectionRate;
    }

    res.status(200).json({
        success: true,
        data: {
            current: currentReport,
            previous: previousReport,
            changes,
            hasComparison: !!previousReport
        }
    });
});

// @desc    Update report status
// @route   PUT /api/financial-reports/:id/status
// @access  Private (Landlord/Agent/Admin)
exports.updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const report = await FinancialReport.findById(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: 'Report not found'
        });
    }

    // Check ownership
    if (report.landlord.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this report'
        });
    }

    report.status = status;
    await report.save();

    res.status(200).json({
        success: true,
        data: report
    });
});
