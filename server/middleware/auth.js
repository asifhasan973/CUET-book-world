const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'cuet-book-world'
  });
}

// Auth middleware that extracts and verifies Firebase ID Token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (tokenError) {
      return res.status(401).json({ message: 'Invalid or expired authentication token', error: tokenError.message });
    }

    req.firebaseUser = decodedToken; // Make token data available to downstream controllers (like sync)

    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      // Allow /sync to proceed without a pre-existing DB user record
      if (req.path === '/sync') {
        return next();
      }
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

