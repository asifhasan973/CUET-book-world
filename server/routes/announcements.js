const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setShowOnHome,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/announcements — Get active announcements (public)
router.get('/', getAnnouncements);

// POST /api/announcements — Create announcement (admin)
router.post('/', authMiddleware, requireRole('admin'), createAnnouncement);

// PUT /api/announcements/:id — Update announcement (admin)
router.put('/:id', authMiddleware, requireRole('admin'), updateAnnouncement);

// PUT /api/announcements/:id/show-on-home — Select the single announcement shown on home (admin)
router.put('/:id/show-on-home', authMiddleware, requireRole('admin'), setShowOnHome);

// DELETE /api/announcements/:id — Delete announcement (admin)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteAnnouncement);

module.exports = router;
