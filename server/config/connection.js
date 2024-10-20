const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thebigevent'; // Default to local DB if MONGODB_URI is not set

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Handling MongoDB connection events
const db = mongoose.connection;

db.on('error', (err) => {
  console.error(`MongoDB error: ${err}`);
});

db.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

db.once('open', () => {
  console.log('Successfully connected to MongoDB');
});

module.exports = db;
