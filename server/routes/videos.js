const express = require('express');
const router = express.Router();
const {
  createVideoSession,
  getMyVideoSessions,
  getVideoSessions,
  approveVideoSession,
  rejectVideoSession
} = require('../controllers/videoController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// POST /api/videos — Request a video session
router.post('/', authMiddleware, createVideoSession);

// GET /api/videos/my — My sessions
router.get('/my', authMiddleware, getMyVideoSessions);

// GET /api/videos — All sessions (librarian/admin)
router.get('/', authMiddleware, requireRole('librarian', 'admin'), getVideoSessions);

// PUT /api/videos/:id/approve — Approve session
router.put('/:id/approve', authMiddleware, requireRole('librarian', 'admin'), approveVideoSession);

// PUT /api/videos/:id/reject — Reject session
router.put('/:id/reject', authMiddleware, requireRole('librarian', 'admin'), rejectVideoSession);

module.exports = router;
