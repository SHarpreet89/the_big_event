import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { authMiddleware } from './utils/auth.js';
import { User, Event, Client, Planner, Message } from './models/models.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { connectToMongoDB, db } from './config/connection.js'; // Correctly import named exports

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// ... other imports

const startApolloServer = async () => {
  console.log(`Starting Apollo Server...`);
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: (req) => {
      console.log('Context called');
      return authMiddleware(req);
    }
  }));
  

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  await connectToMongoDB(); // Await the database connection

  if (db) {
    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
      });
    });
  } else {
    console.error('Failed to connect to the database.');
  }
};

startApolloServer();
