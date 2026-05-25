const User = require('../models/User');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/errors');

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
const syncUser = async (req, res, next) => {
  try {
    const firebaseUid = req.firebaseUser.uid;
    const email = req.firebaseUser.email;
    const { name, studentId, department, year, avatar, requestedRole } = req.body;

    if (!firebaseUid || !email) {
      throw new BadRequestError('firebaseUid and email are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedCuetEmail(normalizedEmail)) {
      throw new ForbiddenError('Use a CUET email ending in @cuet.ac.bd or @student.cuet.ac.bd.');
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
    next(error);
  }
};

// Get current user profile
const getCurrentUser = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// Update user profile
const UPDATABLE_PROFILE_FIELDS = ['name', 'studentId', 'department', 'year', 'avatar', 'notificationsEnabled', 'theme'];

const updateProfile = async (req, res, next) => {
  try {
    // Only allow whitelisted fields to prevent injection of role/status/borrowLimit
    const updates = {};
    for (const field of UPDATABLE_PROFILE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  updateProfile
};

