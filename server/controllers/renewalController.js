const crypto = require('crypto');
const RenewalRequest = require('../models/RenewalRequest');
const BorrowRecord = require('../models/BorrowRecord');
const Notification = require('../models/Notification');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

// Generate Jitsi Meet link
const generateMeetingLink = () => {
  const roomId = crypto.randomBytes(8).toString('hex');
  return `https://meet.jit.si/cuet-bookworld-${roomId}`;
};

// Request renewal
const createRenewal = async (req, res, next) => {
  try {
    const { borrowId, preferredDate, preferredTime, notes } = req.body;

    const borrow = await BorrowRecord.findById(borrowId);
    if (!borrow) throw new NotFoundError('Borrow record not found');
    if (borrow.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Not your borrow record');
    }

    const existing = await RenewalRequest.findOne({ borrowId, status: { $in: ['pending', 'approved'] } });
    if (existing) throw new BadRequestError('A renewal request is already pending or scheduled');

    const renewal = await RenewalRequest.create({
      userId: req.user._id,
      borrowId,
      year: req.user.year,
      preferredDate,
      preferredTime,
      notes,
    });

    res.status(201).json({ message: 'Renewal request submitted! You will be notified when approved.', renewal });
  } catch (error) {
    next(error);
  }
};

// List renewals (librarian/admin)
const getRenewals = async (req, res, next) => {
  try {
    const renewals = await RenewalRequest.find()
      .populate('userId', 'name email studentId department year')
      .populate({
        path: 'borrowId',
        populate: { path: 'bookId', select: 'title authors coverImage' },
      })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(renewals);
  } catch (error) {
    next(error);
  }
};

// My renewals (student)
const getMyRenewals = async (req, res, next) => {
  try {
    const renewals = await RenewalRequest.find({ userId: req.user._id })
      .populate({
        path: 'borrowId',
        populate: { path: 'bookId', select: 'title authors coverImage' },
      })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(renewals);
  } catch (error) {
    next(error);
  }
};

// Approve renewal
const approveRenewal = async (req, res, next) => {
  try {
    const { scheduledDate, scheduledTime } = req.body;
    const renewal = await RenewalRequest.findById(req.params.id)
      .populate({
        path: 'borrowId',
        populate: { path: 'bookId', select: 'title' },
      });
    if (!renewal) throw new NotFoundError('Renewal request not found');
    if (renewal.status !== 'pending') {
      throw new BadRequestError('This renewal is not in pending status');
    }

    const meetingLink = generateMeetingLink();

    renewal.status = 'approved';
    renewal.meetingLink = meetingLink;
    renewal.approvedBy = req.user._id;
    renewal.scheduledDate = scheduledDate || renewal.preferredDate;
    renewal.scheduledTime = scheduledTime || renewal.preferredTime;
    await renewal.save();

    const bookTitle = renewal.borrowId?.bookId?.title || 'your book';
    const rawDate = new Date(renewal.scheduledDate);
    const meetDate = isNaN(rawDate.getTime()) ? String(renewal.scheduledDate) : rawDate.toLocaleDateString();
    const meetTime = renewal.scheduledTime;

    await Notification.create({
      userId: renewal.userId,
      message: `📹 Your renewal for "${bookTitle}" has been approved! A video consultation is scheduled for ${meetDate} at ${meetTime}. Click the meeting link in your Renew page to join.`,
      type: 'success',
      link: '/renew?tab=status',
    });

    res.json({ message: 'Renewal approved with meeting link', renewal, meetingLink });
  } catch (error) {
    next(error);
  }
};

// Complete renewal
const completeRenewal = async (req, res, next) => {
  try {
    const renewal = await RenewalRequest.findById(req.params.id);
    if (!renewal) throw new NotFoundError('Renewal not found');
    if (renewal.status !== 'approved') {
      throw new BadRequestError('Only approved renewals can be completed');
    }

    renewal.status = 'completed';
    renewal.completedAt = new Date();
    await renewal.save();

    const borrow = await BorrowRecord.findById(renewal.borrowId).populate('bookId', 'title');
    if (borrow) {
      const newDue = new Date(borrow.dueDate);
      newDue.setDate(newDue.getDate() + 30);
      borrow.dueDate = newDue;
      borrow.renewalDate = new Date();
      borrow.fine = 0;
      borrow.status = 'active';
      await borrow.save();
    }

    await Notification.create({
      userId: renewal.userId,
      message: `✅ Your renewal for "${borrow?.bookId?.title}" is complete! Your new due date is ${borrow?.dueDate?.toLocaleDateString()}.`,
      type: 'success',
      link: '/renew?tab=status',
    });

    res.json({ message: 'Renewal completed, due date extended', renewal });
  } catch (error) {
    next(error);
  }
};

// Reject renewal
const rejectRenewal = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const renewal = await RenewalRequest.findById(req.params.id)
      .populate({
        path: 'borrowId',
        populate: { path: 'bookId', select: 'title' },
      });
    if (!renewal) throw new NotFoundError('Renewal not found');
    if (!['pending', 'approved'].includes(renewal.status)) {
      throw new BadRequestError('Only pending or approved renewals can be rejected');
    }

    renewal.status = 'rejected';
    renewal.librarianNote = reason || '';
    renewal.approvedBy = req.user._id;
    await renewal.save();

    const bookTitle = renewal.borrowId?.bookId?.title || 'your book';

    await Notification.create({
      userId: renewal.userId,
      message: `❌ Your renewal request for "${bookTitle}" has been rejected.${reason ? ' Reason: ' + reason : ''}`,
      type: 'error',
      link: '/renew?tab=status',
    });

    res.json({ message: 'Renewal rejected', renewal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRenewal,
  getRenewals,
  getMyRenewals,
  approveRenewal,
  completeRenewal,
  rejectRenewal
};
