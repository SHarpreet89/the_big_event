import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb+srv://thebigevent:thebigDB@thebigevent.vvgau.mongodb.net/?retryWrites=true&w=majority&appName=TheBigEvent';

const testConnection = async () => {
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 30000, // Increase socket timeout to 30 seconds
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

testConnection();