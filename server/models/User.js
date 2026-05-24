const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, default: '' },
  department: { type: String, default: 'CSE' },
  year: { type: String, default: '1st' },
  role: { type: String, enum: ['student', 'librarian', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'pending', 'suspended'], default: 'active' },
  memberSince: { type: Date, default: Date.now },
  avatar: { type: String, default: '' },
  borrowLimit: { type: Number, default: 3 },
  notificationsEnabled: { type: Boolean, default: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
