const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = process.env.MONGODB_URI;

const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

if (process.env.NODE_ENV === 'production') {
  // Use native MongoDB driver in production
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  client.connect()
    .then(() => {
      console.log('MongoDB connected using native driver');
      module.exports = client.db();
    })
    .catch((err) => {
      console.log('MongoDB connection error:', err);
      process.exit(1);
    });
} else {
  // Use Mongoose in development
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('MongoDB connected using Mongoose'))
    .catch((err) => {
      console.log('MongoDB connection error:', err);
      process.exit(1);
    });

  module.exports = mongoose.connection;
}