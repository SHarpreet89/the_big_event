import { ApolloServer } from '@apollo/server';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';  // Add Mongoose for MongoDB connection
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import dotenv from 'dotenv';  // Load environment variables

dotenv.config();  // Initialize dotenv to use .env variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set up MongoDB connection
const startServer = async () => {
  try {
    // Connecting to MongoDB
    await mongoose.connect(process.env.MONGODB_URI  , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,  // 5 seconds timeout
    });

    console.log('MongoDB connected successfully');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    // Start Apollo Server
    await server.start();

    // Add GraphQL middleware
    app.use('/graphql', (req, res, next) => {
      console.log('Received request at /graphql');
      next();
    }, expressMiddleware(server));

    // Listen on port 3001
    app.listen({ port: 3001 }, () => {
      console.log('Server running at http://localhost:3001/graphql');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);  // Exit process if connection fails
  }
};

// Start the server
startServer();

// Optional: Mongoose connection logging (for debugging purposes)
mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose is disconnected');
});
