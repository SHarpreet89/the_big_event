import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = 'mongodb+srv://thebiguser:thebigDB@thebigevent.vvgau.mongodb.net/?retryWrites=true&w=majority&appName=TheBigEvent';  // Environment variable set in Render

const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

let db;

const connectToMongoDB = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log(`Using native prduction URI for server login it is ${mongoUri}`);
      // Use native MongoDB driver in production with enhanced options
      const clientOptions = {
        serverSelectionTimeoutMS: 30000, // Timeout for server selection
        socketTimeoutMS: 45000,          // Timeout for socket
        ssl: true,                       // Enable SSL for secure connections
      };

      const client = new MongoClient(mongoUri, clientOptions);
      await client.connect();
      console.log('MongoDB connected using native driver');
      db = client.db();
      console.log(`Connected to database: ${db.databaseName}`);
    } else {
      // Use the existing Mongoose connection method in development
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected using Mongoose');
      db = mongoose.connection;
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Stack trace:', err.stack);
    throw new Error('Database connection failed');
  }
};

export { connectToMongoDB, db };
