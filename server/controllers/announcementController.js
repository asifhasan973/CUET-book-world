const Announcement = require('../models/Announcement');
const { NotFoundError } = require('../utils/errors');

// Get active announcements
const getAnnouncements = async (req, res, next) => {
  try {
    const { all, home } = req.query;

    if (home === 'true') {
      const picked = await Announcement.findOne({ active: true, showOnHome: true }).sort({ updatedAt: -1, createdAt: -1 });
      if (picked) return res.json(picked);

      const latest = await Announcement.findOne({ active: true }).sort({ createdAt: -1 });
      return res.json(latest || null);
    }

    const query = all === 'true' ? {} : { active: true };
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// Create announcement
const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (error) {
    next(error);
  }
};

// Update announcement
const updateAnnouncement = async (req, res, next) => {
  try {
    if (req.body?.showOnHome === true) {
      await Announcement.updateMany({ _id: { $ne: req.params.id } }, { showOnHome: false });
    }
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) throw new NotFoundError('Announcement not found');
    res.json({ message: 'Announcement updated', announcement });
  } catch (error) {
    next(error);
  }
};

// Set show on home
const setShowOnHome = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new NotFoundError('Announcement not found');

    await Announcement.updateMany({}, { showOnHome: false });
    announcement.showOnHome = true;
    announcement.active = true;
    await announcement.save();

    res.json({ message: 'Home announcement updated', announcement });
  } catch (error) {
    next(error);
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new NotFoundError('Announcement not found');
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setShowOnHome,
  deleteAnnouncement
};
