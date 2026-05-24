const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: [{ type: String }],
  publisher: { type: String, default: '' },
  year: { type: Number },
  isbn: { type: String, default: '' },
  edition: { type: String, default: '' },
  subject: [{ type: String }],
  department: [{ type: String }],
  yearLevel: [{ type: Number }],
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  ebookLink: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isEbook: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
