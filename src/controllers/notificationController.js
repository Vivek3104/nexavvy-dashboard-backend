const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const {
      type,
      recipientType,
      title,
      message,
      relatedId,
      relatedModel,
      actionUrl,
    } = req.body;

    const notification = await Notification.create({
      type,
      recipientType,
      userId: req.user._id,
      title,
      message,
      relatedId,
      relatedModel,
      actionUrl,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin notifications
// @route   GET /api/notifications/admin
// @access  Private (Admin)
const getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let query = { recipientType: 'admin' };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipientType: 'admin',
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Contact admin (create activation request notification)
// @route   POST /api/notifications/contact-admin
// @access  Private (User)
const contactAdmin = async (req, res) => {
  try {
    const user = req.user;

    // Create notification for admin
    const notification = await Notification.create({
      type: 'activation_request',
      recipientType: 'admin',
      userId: user._id,
      title: 'Account Activation Request',
      message: `${user.name} (${user.email}) has requested account activation.`,
      actionUrl: `/admin/users/${user._id}`,
    });

    res.status(201).json({
      success: true,
      message:
        'Your request has been sent to admin. You will be contacted soon.',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getAdminNotifications,
  markAsRead,
  contactAdmin,
};
