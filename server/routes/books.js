const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  createReview
} = require('../controllers/bookController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/books — List books with filters
router.get('/', getBooks);

// GET /api/books/:id — Single book
router.get('/:id', getBookById);

// POST /api/books — Add book (librarian/admin)
router.post('/', authMiddleware, requireRole('librarian', 'admin'), createBook);

// PUT /api/books/:id — Edit book
router.put('/:id', authMiddleware, requireRole('librarian', 'admin'), updateBook);

// DELETE /api/books/:id — Delete book
router.delete('/:id', authMiddleware, requireRole('librarian', 'admin'), deleteBook);

// POST /api/books/:id/review — Add review
router.post('/:id/review', authMiddleware, createReview);

module.exports = router;
