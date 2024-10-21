import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = process.env.MONGODB_URI;

const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

let db;

if (process.env.NODE_ENV === 'production') {
  // Use native MongoDB driver in production
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('MongoDB connected using native driver');
    db = client.db();
  } catch (err) {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  }
} else {
  // Use Mongoose in development
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected using Mongoose');
    db = mongoose.connection;
  } catch (err) {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  }
}

export default db;