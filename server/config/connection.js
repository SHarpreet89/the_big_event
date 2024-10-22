import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = process.env.MONGODB_URI;  // Environment variable set in Render

const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

let db;

const connectToMongoDB = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use native MongoDB driver in production
      const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
      await client.connect();
      console.log('MongoDB connected using native driver');
      db = client.db();
    } else {
      // Use Mongoose in development
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected using Mongoose');
      db = mongoose.connection;
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export { connectToMongoDB, db };
