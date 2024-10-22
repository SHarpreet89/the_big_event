import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Adjust the path as necessary

const seedUsers = async () => {
  try {
    // Determine the MongoDB URI based on the environment
    const mongoUri = process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : 'mongodb://127.0.0.1:27017/thebigevent';

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users removed');

    // Create users
    const users = [
      {
        username: 'plannerUser',
        email: 'planner@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Planner',
      },
      {
        username: 'clientUser',
        email: 'client@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Client',
      },
      {
        username: 'adminUser',
        email: 'admin@example.com',
        password: await bcrypt.hash('adminpassword', 10),
        role: 'Admin',
      },
    ];

    // Insert users into the database
    await User.insertMany(users);
    console.log('Users seeded successfully');

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error seeding users:', err);
    await mongoose.connection.close();
  }
};

seedUsers();