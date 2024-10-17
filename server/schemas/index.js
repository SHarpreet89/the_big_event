const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = require('./resolvers');

module.exports = { typeDefs, resolvers };
