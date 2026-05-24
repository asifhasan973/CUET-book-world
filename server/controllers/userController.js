const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const { calculateBorrowFineView } = require('../utils/borrowFines');

// Get all users (admin)
const getUsers = async (req, res) => {
  try {
    const { search, role, status, department } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (department && department !== 'All') query.department = department;

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get all students (librarian/admin)
const getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query).sort({ name: 1 }).lean();
    const fineTotals = await BorrowRecord.aggregate([
      { $match: { userId: { $in: students.map(student => student._id) }, fine: { $gt: 0 } } },
      { $group: { _id: '$userId', fineBalance: { $sum: '$fine' } } },
    ]);
    const fineByUser = new Map(fineTotals.map(item => [item._id.toString(), item.fineBalance]));

    res.json(students.map(student => ({
      ...student,
      fineBalance: fineByUser.get(student._id.toString()) || 0,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Get student's borrows (librarian/admin)
const getStudentBorrows = async (req, res) => {
  try {
    const borrows = await BorrowRecord.find({ userId: req.params.id })
      .populate('bookId', 'title authors')
      .sort({ createdAt: -1 });
    const now = new Date();
    res.json(borrows.map(borrow => calculateBorrowFineView(borrow, now)));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student borrows', error: error.message });
  }
};

// Set a borrow fine (librarian/admin)
const setStudentBorrowFine = async (req, res) => {
  try {
    const fine = Number(req.body?.fine);
    const reason = String(req.body?.reason || 'Fine updated by librarian').trim();

    if (!Number.isFinite(fine) || fine < 0) {
      return res.status(400).json({ message: 'Fine must be a non-negative number' });
    }

    const borrow = await BorrowRecord.findOne({ _id: req.params.borrowId, userId: req.params.userId })
      .populate('bookId', 'title');
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    borrow.fine = Math.round(fine);
    borrow.fineOverride = true;
    borrow.fineReason = reason || 'Fine updated by librarian';
    borrow.fineUpdatedBy = req.user._id;
    borrow.fineUpdatedAt = new Date();
    await borrow.save();

    await Notification.create({
      userId: req.params.userId,
      message: `Your fine for "${borrow.bookId?.title || 'a borrow record'}" is now ${borrow.fine} Tk.`,
      type: borrow.fine > 0 ? 'warning' : 'success',
      link: '/profile?tab=history',
    });

    res.json({ message: 'Fine updated', borrow: calculateBorrowFineView(borrow) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fine', error: error.message });
  }
};

// Remove a borrow record (admin only)
const deleteStudentBorrowRecord = async (req, res) => {
  try {
    const borrow = await BorrowRecord.findOne({ _id: req.params.borrowId, userId: req.params.userId });
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    if (['active', 'pending', 'overdue'].includes(borrow.status)) {
      const book = await Book.findById(borrow.bookId);
      if (book) {
        book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
        await book.save();
      }
    }

    await BorrowRecord.findByIdAndDelete(req.params.borrowId);

    await Notification.create({
      userId: req.params.userId,
      message: `An admin has removed a borrow record from your account.`,
      type: 'info',
      link: '/profile?tab=notifications',
    });

    res.json({ message: 'Borrow record deleted and book availability restored' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting borrow record', error: error.message });
  }
};

// Change user role (admin only)
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'librarian', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Notification.create({
      userId: user._id,
      message: `Your role has been changed to ${role}.`,
      type: 'info',
      link: '/profile?tab=notifications',
    });

    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
};

// Change user status (admin only)
const changeUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  getUsers,
  getStudents,
  getStudentBorrows,
  setStudentBorrowFine,
  deleteStudentBorrowRecord,
  changeUserRole,
  changeUserStatus,
  deleteUser
};
