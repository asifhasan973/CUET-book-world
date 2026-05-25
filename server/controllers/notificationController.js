const Notification = require('../models/Notification');
const { NotFoundError } = require('../utils/errors');

// Get my notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// Mark as read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true });
    if (!notification) throw new NotFoundError('Notification not found');
    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
