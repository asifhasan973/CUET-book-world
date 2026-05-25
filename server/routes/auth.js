const express = require('express');
const router = express.Router();
const { syncUser, getCurrentUser, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/sync — Sync Firebase user to MongoDB
router.post('/sync', authMiddleware, syncUser);

// GET /api/auth/me — Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

// PUT /api/auth/profile — Update user profile
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;

