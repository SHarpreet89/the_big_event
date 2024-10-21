const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust the path as necessary

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/thebigevent');
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
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error seeding users:', err);
    mongoose.connection.close();
  }
};

seedUsers();