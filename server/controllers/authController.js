const User = require('../models/User');

const ALLOWED_EMAIL_DOMAINS = new Set(['cuet.ac.bd', 'student.cuet.ac.bd']);

const isAllowedCuetEmail = (email = '') => {
  const normalized = String(email).trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.has(normalized.slice(atIndex + 1));
};

// Sync Firebase user to MongoDB
const syncUser = async (req, res) => {
  try {
    const { firebaseUid, name, email, studentId, department, year, avatar, requestedRole } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: 'firebaseUid and email are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedCuetEmail(normalizedEmail)) {
      return res.status(403).json({
        message: 'Use a CUET email ending in @cuet.ac.bd or @student.cuet.ac.bd.',
      });
    }

    let user = await User.findOne({ firebaseUid });

    if (user) {
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      let existingByEmail = await User.findOne({ email: normalizedEmail });
      if (existingByEmail) {
        existingByEmail.firebaseUid = firebaseUid;
        if (name) existingByEmail.name = name;
        if (avatar) existingByEmail.avatar = avatar;
        await existingByEmail.save();
        user = existingByEmail;
      } else {
        let role = ['student', 'librarian'].includes(requestedRole) ? requestedRole : 'student';
        if (normalizedEmail === 'librarian@cuet.ac.bd') role = 'librarian';
        if (normalizedEmail === 'admin@cuet.ac.bd') role = 'admin';

        let borrowLimit = 3;
        if (role === 'librarian' || role === 'admin') borrowLimit = 6;

        user = await User.create({
          firebaseUid,
          name: name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          studentId: studentId || '',
          department: department || 'CSE',
          year: (role !== 'student') ? 'Faculty' : (year || '1st'),
          role,
          status: 'active',
          avatar: avatar || '',
          borrowLimit,
        });
      }
    }

    res.json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(500).json({ message: 'Error syncing user', error: error.message });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    if (!firebaseUid) {
      return res.status(401).json({ message: 'No firebase UID provided' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    if (!firebaseUid) {
      return res.status(401).json({ message: 'No firebase UID provided' });
    }

    const updates = req.body;
    delete updates.role;
    delete updates.status;
    delete updates.firebaseUid;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  updateProfile
};
