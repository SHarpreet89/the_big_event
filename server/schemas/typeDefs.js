const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String
    role: String!
    events: [Event]
  }

  type Event {
    _id: ID!
    planner: User! 
    description: String
    title: String!
    startDate: String!
    endDate: String!
    location: String 
  }

  type AuthPayload {   # New AuthPayload type to return token and user
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!] 
    user(id: ID!): User
    events: [Event!] 
    event(id: ID!): Event
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!, role: String!): User
    login(email: String!, password: String!): AuthPayload  # Updated login mutation
    createEvent(title: String!, description: String, startDate: String!, endDate: String!, plannerId: ID!): Event
  }
`;

module.exports = typeDefs;
