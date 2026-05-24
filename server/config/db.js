const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    } else {
      console.warn('⚠️ MONGODB_URI is not set. Running without database connection.');
    }
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
