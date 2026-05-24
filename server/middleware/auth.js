const User = require('../models/User');

// Simple auth middleware that extracts user from a token-like header
// Since we don't have Firebase Admin service account, we use a simplified approach:
// The client sends the Firebase UID and email in the header after client-side Firebase auth
const authMiddleware = async (req, res, next) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    if (!firebaseUid) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please sync your account.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Auth middleware error', error: error.message });
  }
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
