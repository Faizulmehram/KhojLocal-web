const Notification = require('../models/Notification');

// Helper function to create a notification
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    
    // Filter by read status if specified
    if (req.query.unread === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedOrder', 'orderNumber status')
      .populate('relatedBooking', 'bookingNumber status');

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.user._id,
      isRead: true,
    });

    res.json({ message: 'All read notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      message: 'Error clearing notifications',
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
};
