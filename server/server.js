import express from 'express';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { authMiddleware } from './utils/auth.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { connectToMongoDB, db } from './config/connection.js';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// ... (rest of your imports and setup)

const startApolloServer = async () => {
  await connectToMongoDB(); // Ensure MongoDB connection is established

  if (!db) {
    console.error('Failed to connect to MongoDB');
    process.exit(1);
  }

  await server.start();

  server.applyMiddleware({ app }); // Apply Apollo middleware to Express

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Use a different approach for development and production
  if (process.env.NODE_ENV === 'production') {
    // In production, we're using the native MongoDB driver
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  } else {
    // In development, we're using Mongoose
    mongoose.connection.once('open', () => {
      app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
      });
    });
  }
};

startApolloServer();