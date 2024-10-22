const typeDefs = `

type Query {
  hello: String
}

  type User {
    id: ID!
    username: String!
    email: String!
    phone: String
    password: String!
    role: String!
    events: [Event!]
  }

  type Client {
    id: ID!
    name: String!
    planner: User
    events: [Event]
    notes: [String]
    requestList: [Request]
    actionedRequestList: [ActionedRequest]
  }

  type Request {
    item: String!
    description: String
  }

  type ActionedRequest {
    item: String!
    status: String!
    actionedBy: User
    actionedAt: String
  }

  type Event {
    id: ID!
    name: String!
    description: String
    startDate: String!  # This replaces 'date'
    endDate: String!
    location: String!
    planner: User
    clients: [Client]
    createdAt: String
    completedAt: String
  }

  type Planner {
    id: ID!
    name: String!
    events: [Event]
    clients: [Client]
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type CreateClientResponse {
    user: User
    client: Client
  }

  type Query {
    me: User
    users: [User!]
    user(id: ID!): User
    clients: [Client!]
    client(id: ID!): Client
    events: [Event!]
    event(id: ID!): Event
    planners: [Planner!]
    planner(id: ID!): Planner
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!, role: String!): User
    createClient(name: String!, email: String!, phone: String, password: String!, plannerId: ID, eventId: ID): CreateClientResponse
    assignClientToPlannerAndEvent(clientId: ID!, plannerId: ID, eventId: ID): Client
    login(email: String!, password: String!): AuthPayload
    createEvent(
      name: String!,
      description: String,
      startDate: String!,
      endDate: String!,
      location: String!,
      plannerId: ID,
      clientId: ID
    ): Event
    createPlanner(name: String!): Planner!
  }
`;

export default typeDefs;