import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const mongoUri = 'mongodb+srv://thebiguser:thebigDB@thebigevent.vvgau.mongodb.net/?retryWrites=true&w=majority&appName=TheBigEvent';

const seedDatabase = async () => {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db('thebigevent'); // Replace with your actual database name
    const usersCollection = db.collection('users');

    // Clear existing users
    await usersCollection.deleteMany({});
    console.log('Existing users removed');

    // Create a planner user
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    const plannerUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.insertOne(plannerUser);
    console.log('Admin user seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

seedDatabase();