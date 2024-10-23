const typeDefs = `
  type Query {
    hello: String
    testConnection: String
    me: User
    users: [User!]
    user(id: ID!): User
    clients: [Client!]
    client(id: ID!): Client
    events: [Event!]
    event(id: ID!): Event
    planners: [Planner!]
    planner(id: ID!): Planner
    getMessages(plannerId: ID!, clientId: ID!, eventId: ID!): [Message!]!
  }

  type Message {
    id: ID!
    content: String!
    senderId: ID!
    senderModel: String!
    receiverId: ID!
    receiverModel: String!
    eventId: ID!
    timestamp: String!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!, role: String!): User
    createClient(name: String!, email: String!, phone: String, password: String!, plannerId: ID, eventId: ID): CreateClientResponse
    createPlanner(name: String!, email: String!, password: String!): PlannerResponse!
    assignClientToPlannerAndEvent(clientId: ID!, plannerId: ID, eventId: ID): Client
    addClientNote(clientId: ID!, note: String!): Client
    updateClientNotes(clientId: ID!, notes: [String!]): Client
    login(email: String!, password: String!): AuthPayload
    createEvent(
      name: String!
      description: String
      startDate: String!
      endDate: String!
      location: String!
      plannerId: ID
      clientId: ID
    ): Event
    sendMessage(
      senderId: ID!
      senderModel: String!
      receiverId: ID!
      receiverModel: String!
      eventId: ID!
      content: String!
    ): Message!
    updateEvent(
      id: ID!
      name: String!
      description: String
      startDate: String!
      endDate: String!
      location: String!
      plannerId: ID
      clientId: ID
    ): Event
    deleteEvent(id: ID!): DeleteEventResponse
  }

  type DeleteEventResponse {
    id: ID!
    success: Boolean!
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
    planner: Planner
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
    startDate: String!
    endDate: String!
    location: String!
    planner: Planner
    clients: [Client!]!
    subevents: [SubEvent]
    createdAt: String
    completedAt: String
  }

  type SubEvent {
    id: ID!
    name: String!
    startDate: String!
    endDate: String!
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
    client: Client
    planner: Planner
  }

  type CreateClientResponse {
    user: User
    client: Client
  }
  
  type PlannerResponse {
    user: User!
    planner: Planner!
  }
`;

export default typeDefs;