const express = require('express');
const router = express.Router();
const {
  getUsers,
  getStudents,
  getStudentBorrows,
  setStudentBorrowFine,
  deleteStudentBorrowRecord,
  changeUserRole,
  changeUserStatus,
  deleteUser
} = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/users — All users (admin)
router.get('/', authMiddleware, requireRole('admin'), getUsers);

// GET /api/users/students — All students (librarian/admin)
router.get('/students', authMiddleware, requireRole('librarian', 'admin'), getStudents);

// GET /api/users/:id/borrows — Student's borrow history (librarian/admin)
router.get('/:id/borrows', authMiddleware, requireRole('librarian', 'admin'), getStudentBorrows);

// PUT /api/users/:userId/borrows/:borrowId/fine — Set a borrow fine (librarian/admin)
router.put('/:userId/borrows/:borrowId/fine', authMiddleware, requireRole('librarian', 'admin'), setStudentBorrowFine);

// DELETE /api/users/:userId/borrows/:borrowId — Remove a borrow from student (admin only)
router.delete('/:userId/borrows/:borrowId', authMiddleware, requireRole('admin'), deleteStudentBorrowRecord);

// PUT /api/users/:id/role — Change role (admin only)
router.put('/:id/role', authMiddleware, requireRole('admin'), changeUserRole);

// PUT /api/users/:id/status — Activate/suspend (admin only)
router.put('/:id/status', authMiddleware, requireRole('admin'), changeUserStatus);

// DELETE /api/users/:id — Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteUser);

module.exports = router;
