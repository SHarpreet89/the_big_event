// Importing Mongoose with ES6 syntax
import mongoose from 'mongoose';

// MongoDB connection URIs for development and production
const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = 'mongodb+srv://thebiguser:thebigDB@thebigevent.vvgau.mongodb.net/?retryWrites=true&w=majority&appName=TheBigEvent';  // Environment variable set in Render

// Determine which URI to use based on the environment
const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

let db;

const connectToMongoDB = async () => {
  try {
    // Log connection attempt
    console.log(`Connecting to MongoDB using Mongoose, URI: ${mongoUri}`);

    // Use Mongoose for both development and production environments
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: process.env.NODE_ENV === 'production', // Enable SSL in production
      serverSelectionTimeoutMS: 30000,           // Timeout for server selection
      socketTimeoutMS: 45000,                    // Timeout for socket
    });

    // Connection success
    console.log('MongoDB connected successfully using Mongoose');
    db = mongoose.connection;

    // Log the name of the connected database
    console.log(`Connected to database: ${db.name}`);
  } catch (err) {
    // Log any connection errors and rethrow
    console.error('MongoDB connection error:', err.message);
    console.error('Stack trace:', err.stack);
    throw new Error('Database connection failed');
  }
};

// Export the connection and database reference
export { connectToMongoDB, db };