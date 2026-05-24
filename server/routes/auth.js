const express = require('express');
const router = express.Router();
const { syncUser, getCurrentUser, updateProfile } = require('../controllers/authController');

// POST /api/auth/sync — Sync Firebase user to MongoDB
router.post('/sync', syncUser);

// GET /api/auth/me — Get current user profile
router.get('/me', getCurrentUser);

// PUT /api/auth/profile — Update user profile
router.put('/profile', updateProfile);

module.exports = router;
