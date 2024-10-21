import express from 'express';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { authMiddleware } from './utils/auth.js';
import { User, Event, Client, Planner, Message } from './models/models.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { connectToMongoDB, db } from './config/connection.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authMiddleware({ req }), // Use authMiddleware here
});

const app = express();

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

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

startApolloServer();