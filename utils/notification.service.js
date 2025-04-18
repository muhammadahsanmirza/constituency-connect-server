const Notification = require('../model/notification.model');

// Create a notification
exports.createNotification = async (recipientId, type, title, message, complaintId = null) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      relatedComplaint: complaintId,
      isRead: false
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
exports.getUserNotifications = async (userId, limit = 20, skip = 0) => {
  try {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
exports.markAsRead = async (notificationId) => {
  try {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (userId) => {
  try {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread notification count
exports.getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }
};