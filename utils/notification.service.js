const Notification = require('../model/notification.model');

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.recipient - User ID of the recipient
 * @param {string} notificationData.type - Type of notification
 * @param {string} notificationData.title - Title of the notification
 * @param {string} notificationData.message - Content of the notification
 * @param {string} [notificationData.relatedComplaint] - ID of related complaint (optional)
 * @returns {Promise<Object>} Created notification
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      recipient: notificationData.recipient,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedComplaint: notificationData.relatedComplaint
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of notifications
 */
exports.getUserNotifications = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    
    return await Notification.paginate(
      { recipient: userId },
      {
        page,
        limit,
        sort: { createdAt: -1 }
      }
    );
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
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

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of update operation
 */
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

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
exports.getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};