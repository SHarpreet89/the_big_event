import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import bcrypt from 'bcrypt';
import { User } from '../models/models.js';

const secret = 'mysecretsshhhhh';
const expiration = '24h';

export const AuthenticationError = new GraphQLError('Could not authenticate user.', {
  extensions: {
    code: 'UNAUTHENTICATED',
  },
});

export const authMiddleware = ({ req }) => {
  // allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  // ["Bearer", "<tokenvalue>"]
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch {
    console.log('Invalid token');
  }

  return req;
};

export const signToken = ({ username, email, _id }) => {
  const payload = { username, email, _id };

  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    throw new Error('User not found');
  }

  const a = 'adminpassword';
  const b = '$2b$10$0g7OVUPS0WzI9TVKbjru0uWfscAktDaZJc/qefTXfHE5zgWw30I6C';

  const test = await bcrypt.compare(a, b);

  console.log(`bcrypt Test ${test}`);

  const isValid = await bcrypt.compare(password, user.password);
  console.log(`Password Validation Check ${isValid}`);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  return user;
};

