const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const { calculateBorrowFineView, getAutoOverdueFine } = require('../utils/borrowFines');

const BORROW_REJECTION_FINE = 50;

// Create borrow request
const createBorrow = async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = req.user;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    const activeCount = await BorrowRecord.countDocuments({
      userId: user._id,
      status: { $in: ['active', 'pending'] },
    });
    if (activeCount >= user.borrowLimit) {
      return res.status(400).json({ message: `You have reached your borrow limit (${user.borrowLimit})` });
    }

    const existing = await BorrowRecord.findOne({
      userId: user._id,
      bookId,
      status: { $in: ['active', 'pending'] },
    });
    if (existing) return res.status(400).json({ message: 'You already have a pending/active borrow for this book' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const borrow = await BorrowRecord.create({
      userId: user._id,
      bookId,
      dueDate,
      status: 'pending',
    });

    res.status(201).json({ message: 'Borrow request submitted', borrow });
  } catch (error) {
    res.status(500).json({ message: 'Error creating borrow request', error: error.message });
  }
};

// Student's borrows
const getMyBorrows = async (req, res) => {
  try {
    const borrows = await BorrowRecord.find({ userId: req.user._id })
      .populate('bookId', 'title authors coverImage')
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = borrows.map(b => calculateBorrowFineView(b, now));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrows', error: error.message });
  }
};

// All borrows (librarian/admin)
const getAllBorrows = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const borrows = await BorrowRecord.find(query)
      .populate('bookId', 'title authors')
      .populate('userId', 'name email studentId department')
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = borrows.map(b => calculateBorrowFineView(b, now));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrows', error: error.message });
  }
};

// Approve borrow
const approveBorrow = async (req, res) => {
  try {
    const borrow = await BorrowRecord.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.status !== 'pending') return res.status(400).json({ message: 'Cannot approve this borrow' });

    const book = await Book.findById(borrow.bookId);
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    borrow.status = 'active';
    borrow.borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    borrow.dueDate = dueDate;
    await borrow.save();

    book.availableCopies -= 1;
    await book.save();

    await Notification.create({
      userId: borrow.userId,
      message: `Your borrow request for "${book.title}" has been approved! Due: ${dueDate.toLocaleDateString()}`,
      type: 'success',
      link: '/profile?tab=borrows',
    });

    res.json({ message: 'Borrow approved', borrow });
  } catch (error) {
    res.status(500).json({ message: 'Error approving borrow', error: error.message });
  }
};

// Reject borrow
const rejectBorrow = async (req, res) => {
  try {
    const borrow = await BorrowRecord.findById(req.params.id).populate('bookId', 'title');
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.status !== 'pending') return res.status(400).json({ message: 'Only pending borrow requests can be rejected' });

    borrow.status = 'rejected';
    borrow.fine = Math.max(Number(borrow.fine || 0), BORROW_REJECTION_FINE);
    borrow.fineReason = 'Borrow request rejected by librarian';
    borrow.fineUpdatedBy = req.user._id;
    borrow.fineUpdatedAt = new Date();
    await borrow.save();

    await Notification.create({
      userId: borrow.userId,
      message: `Your borrow request for "${borrow.bookId.title}" has been rejected. A ${BORROW_REJECTION_FINE} Tk fine has been added.`,
      type: 'error',
      link: '/profile?tab=history',
    });

    res.json({ message: 'Borrow rejected', borrow });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting borrow', error: error.message });
  }
};

// Return book
const returnBook = async (req, res) => {
  try {
    const borrow = await BorrowRecord.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    borrow.status = 'returned';
    borrow.returnDate = new Date();

    const now = new Date();
    const overdueFine = getAutoOverdueFine(borrow, now);
    if (overdueFine > 0 && !borrow.fineOverride) {
      borrow.fine = Math.max(Number(borrow.fine || 0), overdueFine);
      borrow.fineReason = 'Overdue return fine';
    }
    await borrow.save();

    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
      await book.save();
    }

    res.json({ message: 'Book returned', borrow });
  } catch (error) {
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
};

module.exports = {
  createBorrow,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  rejectBorrow,
  returnBook
};
