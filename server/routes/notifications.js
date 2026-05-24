const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/notifications — Get my notifications
router.get('/', authMiddleware, getNotifications);

// PUT /api/notifications/:id/read — Mark as read
router.put('/:id/read', authMiddleware, markAsRead);

// PUT /api/notifications/read-all — Mark all as read
router.put('/read-all', authMiddleware, markAllAsRead);

module.exports = router;
