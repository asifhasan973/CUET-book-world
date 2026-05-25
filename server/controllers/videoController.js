const VideoSession = require('../models/VideoSession');
const Notification = require('../models/Notification');
const { NotFoundError } = require('../utils/errors');

// Request a video session
const createVideoSession = async (req, res, next) => {
  try {
    const session = await VideoSession.create({
      userId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ message: 'Session requested', session });
  } catch (error) {
    next(error);
  }
};

// My sessions (student)
const getMyVideoSessions = async (req, res, next) => {
  try {
    const sessions = await VideoSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// All sessions (librarian/admin)
const getVideoSessions = async (req, res, next) => {
  try {
    const sessions = await VideoSession.find()
      .populate('userId', 'name email studentId department')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// Approve session
const approveVideoSession = async (req, res, next) => {
  try {
    const { meetingLink } = req.body;
    const session = await VideoSession.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', meetingLink, hostName: req.user.name },
      { new: true }
    );
    if (!session) throw new NotFoundError('Session not found');

    await Notification.create({
      userId: session.userId,
      message: `Your video consultation "${session.topic}" has been approved! Join link: ${meetingLink}`,
      type: 'success',
      link: '/profile?tab=notifications',
    });

    res.json({ message: 'Session approved', session });
  } catch (error) {
    next(error);
  }
};

// Reject session
const rejectVideoSession = async (req, res, next) => {
  try {
    const session = await VideoSession.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!session) throw new NotFoundError('Session not found');

    await Notification.create({
      userId: session.userId,
      message: `Your video consultation request "${session.topic}" has been rejected.`,
      type: 'error',
      link: '/profile?tab=notifications',
    });

    res.json({ message: 'Session rejected', session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVideoSession,
  getMyVideoSessions,
  getVideoSessions,
  approveVideoSession,
  rejectVideoSession
};
