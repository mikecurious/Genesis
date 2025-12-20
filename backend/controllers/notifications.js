const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = { user: req.user._id };

        // Optional type filter
        if (req.query.type) {
            filter.type = req.query.type;
        }

        // Optional read status filter
        if (req.query.read !== undefined) {
            filter.read = req.query.read === 'true';
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('metadata.leadId', 'client dealType')
            .populate('metadata.propertyId', 'title location');

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching notifications'
        });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error getting unread count'
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        // Make sure user owns notification
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this notification'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error marking notification as read'
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error marking all notifications as read'
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        // Make sure user owns notification
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to delete this notification'
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting notification'
        });
    }
};

// @desc    Create notification (internal use)
exports.createNotification = async (userId, notificationData) => {
    try {
        const notification = await Notification.create({
            user: userId,
            ...notificationData
        });

        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};
