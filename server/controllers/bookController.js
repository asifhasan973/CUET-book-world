const Book = require('../models/Book');
const Review = require('../models/Review');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { escapeRegex } = require('../utils/string');

// Allowed fields for book creation/update (prevents injection of rating, reviewCount, etc.)
const BOOK_MUTABLE_FIELDS = [
  'title', 'authors', 'publisher', 'year', 'isbn', 'edition',
  'subject', 'department', 'yearLevel', 'totalCopies', 'availableCopies',
  'description', 'coverImage', 'ebookLink', 'isEbook',
];

// List books with filters
const getBooks = async (req, res, next) => {
  try {
    const { search, department, category, availability, sort, page = 1, limit = 12, ebook } = req.query;
    const query = {};

    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { authors: { $regex: escapedSearch, $options: 'i' } },
        { isbn: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (category && category !== 'All') {
      query.subject = category;
    }

    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'borrowed') {
      query.availableCopies = 0;
    }

    if (ebook === 'true') {
      query.isEbook = true;
    } else if (ebook === 'false') {
      query.isEbook = false;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'alphabetical') sortOption = { title: 1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popular') sortOption = { reviewCount: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      books,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Single book detail
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) throw new NotFoundError('Book not found');

    const reviews = await Review.find({ bookId: book._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ book, reviews });
  } catch (error) {
    next(error);
  }
};

// Add book
const createBook = async (req, res, next) => {
  try {
    const data = {};
    for (const field of BOOK_MUTABLE_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const book = await Book.create(data);
    res.status(201).json({ message: 'Book added', book });
  } catch (error) {
    next(error);
  }
};

// Edit book
const updateBook = async (req, res, next) => {
  try {
    const data = {};
    for (const field of BOOK_MUTABLE_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const book = await Book.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!book) throw new NotFoundError('Book not found');
    res.json({ message: 'Book updated', book });
  } catch (error) {
    next(error);
  }
};

// Delete book
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) throw new NotFoundError('Book not found');
    res.json({ message: 'Book deleted' });
  } catch (error) {
    next(error);
  }
};

// Add review
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) throw new NotFoundError('Book not found');

    const existing = await Review.findOne({ bookId: book._id, userId: req.user._id });
    if (existing) throw new BadRequestError('You have already reviewed this book');

    const review = await Review.create({
      bookId: book._id,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });

    const allReviews = await Review.find({ bookId: book._id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    book.rating = Math.round(avgRating * 10) / 10;
    book.reviewCount = allReviews.length;
    await book.save();

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  createReview
};
