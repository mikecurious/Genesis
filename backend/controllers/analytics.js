const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = asyncHandler(async (req, res) => {
    try {
        // Get counts for current user's data
        const userId = req.user._id;
        
        const [totalProperties, totalLeads, activeLeads, totalUsers] = await Promise.all([
            Property.countDocuments({ createdBy: userId }),
            Lead.countDocuments({ createdBy: userId }),
            Lead.countDocuments({ createdBy: userId, status: 'active' }),
            User.countDocuments() // This might need to be restricted based on user role
        ]);

        // Get recent leads
        const recentLeads = await Lead.find({ createdBy: userId })
            .populate('property', 'title')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('client dealType status createdAt');

        res.json({
            success: true,
            data: {
                overview: {
                    totalProperties,
                    totalLeads,
                    activeLeads,
                    totalUsers
                },
                recentLeads
            }
        });
    } catch (error) {
        console.error('Error getting analytics overview:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving analytics overview'
        });
    }
});

// @desc    Get lead analytics
// @route   GET /api/analytics/leads
// @access  Private
exports.getLeadAnalytics = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get lead statistics
        const leadStats = await Lead.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get leads by deal type
        const dealTypeStats = await Lead.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: '$dealType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                leadsByStatus: leadStats,
                leadsByDealType: dealTypeStats
            }
        });
    } catch (error) {
        console.error('Error getting lead analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving lead analytics'
        });
    }
});

// @desc    Get property analytics
// @route   GET /api/analytics/properties
// @access  Private
exports.getPropertyAnalytics = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get property statistics
        const propertyStats = await Property.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: '$dealType',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        // Get properties by type
        const typeStats = await Property.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                propertiesByDealType: propertyStats,
                propertiesByType: typeStats
            }
        });
    } catch (error) {
        console.error('Error getting property analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving property analytics'
        });
    }
});

// @desc    Get trends analytics
// @route   GET /api/analytics/trends
// @access  Private
exports.getTrends = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get leads created in the last 30 days grouped by day
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const leadTrends = await Lead.aggregate([
            { 
                $match: { 
                    createdBy: userId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get property creation trends
        const propertyTrends = await Property.aggregate([
            { 
                $match: { 
                    createdBy: userId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            success: true,
            data: {
                leadTrends,
                propertyTrends
            }
        });
    } catch (error) {
        console.error('Error getting trends analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving trends analytics'
        });
    }
});
