import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    token: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    login(email: String!, password: String!): User
  }
`;
