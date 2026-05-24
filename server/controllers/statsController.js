const Book = require('../models/Book');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

// Get stats
const getStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ isEbook: false });
    const totalEbooks = await Book.countDocuments({ isEbook: true });
    const totalUsers = await User.countDocuments();
    const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const activeBorrows = await BorrowRecord.countDocuments({ status: 'active' });
    const pendingBorrows = await BorrowRecord.countDocuments({ status: 'pending' });
    const overdueBorrows = await BorrowRecord.countDocuments({ status: 'overdue' });

    const now = new Date();
    const overdueActual = await BorrowRecord.countDocuments({
      status: 'active',
      dueDate: { $lt: now },
    });

    const fineAgg = await BorrowRecord.aggregate([
      { $match: { fine: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$fine' } } },
    ]);
    const totalFines = fineAgg.length > 0 ? fineAgg[0].total : 0;

    const popularBooks = await BorrowRecord.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      { $project: { title: '$book.title', count: 1 } },
    ]);

    const borrowsByDept = await BorrowRecord.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $group: { _id: '$user.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalBooks,
      totalEbooks,
      totalUsers,
      activeStudents,
      pendingUsers,
      activeBorrows,
      pendingBorrows,
      overdueBorrows: overdueBorrows + overdueActual,
      totalFines,
      popularBooks,
      borrowsByDept,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  getStats
};
