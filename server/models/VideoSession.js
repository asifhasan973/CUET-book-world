const mongoose = require('mongoose');

const videoSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  preferredDate: { type: Date },
  preferredTime: { type: String },
  type: { type: String, enum: ['one-on-one', 'group'], default: 'one-on-one' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  meetingLink: { type: String, default: '' },
  hostName: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('VideoSession', videoSessionSchema);
