const express = require('express');
const router = express.Router();
const {
  createBorrow,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  rejectBorrow,
  returnBook
} = require('../controllers/borrowController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// POST /api/borrows — Create borrow request
router.post('/', authMiddleware, createBorrow);

// GET /api/borrows/my — Student's borrows
router.get('/my', authMiddleware, getMyBorrows);

// GET /api/borrows/all — All borrows (librarian/admin)
router.get('/all', authMiddleware, requireRole('librarian', 'admin'), getAllBorrows);

// PUT /api/borrows/:id/approve — Approve borrow
router.put('/:id/approve', authMiddleware, requireRole('librarian', 'admin'), approveBorrow);

// PUT /api/borrows/:id/reject — Reject borrow
router.put('/:id/reject', authMiddleware, requireRole('librarian', 'admin'), rejectBorrow);

// PUT /api/borrows/:id/return — Return book
router.put('/:id/return', authMiddleware, requireRole('librarian', 'admin'), returnBook);

module.exports = router;
