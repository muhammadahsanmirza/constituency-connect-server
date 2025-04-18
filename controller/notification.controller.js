const notificationService = require('../utils/notification.service');
const responseHandler = require('../utils/responseHandler');

// Get notifications for the authenticated user
exports.getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const notifications = await notificationService.getUserNotifications(req.user.userId, limit, skip);
    const unreadCount = await notificationService.getUnreadCount(req.user.userId);
    
    responseHandler.success(res, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await notificationService.markAsRead(notificationId);
    
    if (!notification) {
      return responseHandler.notFound(res, 'Notification not found');
    }
    
    responseHandler.success(res, 'Notification marked as read', notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.userId);
    
    responseHandler.success(res, 'All notifications marked as read');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    
    responseHandler.success(res, 'Unread notification count retrieved', { count });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    responseHandler.serverError(res, error.message);
  }
};