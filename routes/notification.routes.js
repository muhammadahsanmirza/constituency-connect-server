const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

// Get user notifications
router.get('/', verifyAccessToken, notificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', verifyAccessToken, notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', verifyAccessToken, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', verifyAccessToken, notificationController.markAllAsRead);

module.exports = router;