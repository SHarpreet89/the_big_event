import { ApolloServer } from '@apollo/server';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToMongoDB, db } from './config/connection.js';  // Import connection handler
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import dotenv from 'dotenv'; // Load environment variables
import { authMiddleware } from './utils/auth.js';

// Load .env in development mode
if (process.env.NODE_ENV !== 'production') {
  dotenv.config(); // Load environment variables from .env in development
}

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

// Set up and start the Apollo Server
const startApolloServer = async () => {
  try {
    // Connecting to MongoDB using the connectToMongoDB function
    await connectToMongoDB(); // Use your logic from connection.js

    if (!db) {
      console.error('Failed to connect to MongoDB');
      process.exit(1);
    }

    // Initialize Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();

    // GraphQL middleware with optional context injection (e.g., for authentication)
    app.use('/graphql', expressMiddleware(server, {
      context: authMiddleware
    }));

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/dist')));

      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      });
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`GraphQL API available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Error starting the server:', error.message);
    process.exit(1);
  }
};

// Start Apollo server
startApolloServer();
