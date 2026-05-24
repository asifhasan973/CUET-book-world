const Announcement = require('../models/Announcement');

// Get active announcements
const getAnnouncements = async (req, res) => {
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
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    if (req.body?.showOnHome === true) {
      await Announcement.updateMany({ _id: { $ne: req.params.id } }, { showOnHome: false });
    }
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement updated', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
};

// Set show on home
const setShowOnHome = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    await Announcement.updateMany({}, { showOnHome: false });
    announcement.showOnHome = true;
    announcement.active = true;
    await announcement.save();

    res.json({ message: 'Home announcement updated', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error updating home announcement', error: error.message });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setShowOnHome,
  deleteAnnouncement
};
