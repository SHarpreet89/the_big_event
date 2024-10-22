import jwt from 'jsonwebtoken';

export const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
  Mutation: {
    login: (_, { email, password }) => {
      // Simulate a user database
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'password123', // This should be hashed in real use cases
      };

      // Simulate credential checking
      if (email === mockUser.email && password === mockUser.password) {
        // Create a simple token (normally you'd add a secret and other data)
        const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'your_secret_key', {
          expiresIn: '1h',
        });

        // Return the user with the token
        return {
          id: mockUser.id,
          email: mockUser.email,
          token,
        };
      }

      // If credentials don't match
      throw new Error('Invalid credentials');
    },
  },
};
