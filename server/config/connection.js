const mongoose = require('mongoose');

const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = 'mongodb+srv://thebiguser:thebigDB@thebigevent.vvgau.mongodb.net/?retryWrites=true&w=majority&appName=TheBigEvent';  // Environment variable set in Render

const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

let db;

const connectToMongoDB = async () => {
  try {
    // Use Mongoose for both development and production environments
    console.log(`Connecting to MongoDB using Mongoose, URI: ${mongoUri}`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: process.env.NODE_ENV === 'production', // Enable SSL in production
      serverSelectionTimeoutMS: 30000,           // Timeout for server selection
      socketTimeoutMS: 45000,                    // Timeout for socket
    });

    console.log('MongoDB connected successfully using Mongoose');
    db = mongoose.connection;

    console.log(`Connected to database: ${db.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Stack trace:', err.stack);
    throw new Error('Database connection failed');
  }
};

export { connectToMongoDB, db };