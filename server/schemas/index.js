// const { gql } = require('apollo-server');

// const typeDefs = gql`
//   type Query {
//     hello: String
//   }
// `;

const bcrypt = require('bcrypt');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

module.exports = { typeDefs, resolvers };
