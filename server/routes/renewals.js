const express = require('express');
const router = express.Router();
const {
  createRenewal,
  getRenewals,
  getMyRenewals,
  approveRenewal,
  completeRenewal,
  rejectRenewal
} = require('../controllers/renewalController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// POST /api/renewals — Request renewal
router.post('/', authMiddleware, createRenewal);

// GET /api/renewals — List renewals (librarian/admin)
router.get('/', authMiddleware, requireRole('librarian', 'admin'), getRenewals);

// GET /api/renewals/my — My renewals (student)
router.get('/my', authMiddleware, getMyRenewals);

// PUT /api/renewals/:id/approve — Approve with auto-generated meeting link
router.put('/:id/approve', authMiddleware, requireRole('librarian', 'admin'), approveRenewal);

// PUT /api/renewals/:id/complete — Mark consultation as done & extend due date
router.put('/:id/complete', authMiddleware, requireRole('librarian', 'admin'), completeRenewal);

// PUT /api/renewals/:id/reject — Reject renewal
router.put('/:id/reject', authMiddleware, requireRole('librarian', 'admin'), rejectRenewal);

module.exports = router;
