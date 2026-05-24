const mongoose = require('mongoose');

const renewalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord', required: true },
  year: { type: String },
  preferredDate: { type: Date },
  preferredTime: { type: String },
  scheduledDate: { type: Date },
  scheduledTime: { type: String },
  notes: { type: String, default: '' },
  librarianNote: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' },
  meetingLink: { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('RenewalRequest', renewalRequestSchema);
