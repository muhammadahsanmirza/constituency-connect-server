const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing user notifications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - recipient
 *         - type
 *         - title
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the notification
 *         recipient:
 *           type: string
 *           description: User ID of the notification recipient
 *         type:
 *           type: string
 *           enum: [complaint_status_update, new_complaint, complaint_response]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Title of the notification
 *         message:
 *           type: string
 *           description: Content of the notification
 *         relatedComplaint:
 *           type: string
 *           description: ID of the related complaint (if applicable)
 *         isRead:
 *           type: boolean
 *           default: false
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the notification was created
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notifications]
 *     description: Retrieve paginated list of notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notifications retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', verifyAccessToken, notificationController.getUserNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     description: Retrieve the count of unread notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Unread notification count retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/unread-count', verifyAccessToken, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     description: Mark a specific notification as read for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request - Notification ID is required
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Notification not found or not owned by you
 *       500:
 *         description: Server error
 */
router.patch('/:notificationId/read', verifyAccessToken, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     description: Mark all notifications as read for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.patch('/mark-all-read', verifyAccessToken, notificationController.markAllAsRead);

module.exports = router;