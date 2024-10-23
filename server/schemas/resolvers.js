import { User, Client, Event, Planner, Message } from '../models/models.js';
import { signToken, authenticateUser } from '../utils/auth.js';
import { db } from '../config/connection.js';
import mongoose from 'mongoose'; // You need mongoose here for connection state check

const resolvers = {
  Query: {
    hello: () => 'Hello world!',

    testConnection: async () => {
      try {
        const connectionState = mongoose.connection.readyState;
        if (connectionState === 1 || db) {
          return "MongoDB connection successful";
        } else {
          console.error(`MongoDB connection is not in a ready state. Current state: ${connectionState}`);
          throw new Error("Not connected");
        }
      } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        return "Error connecting to MongoDB";
      }
    },

    me: async (parent, args, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return User.findById(context.user.id);
    },

    getMessages: async (parent, { plannerId, clientId, eventId }) => {
      try {
        console.log('Fetching messages with params:', { plannerId, clientId, eventId });
    
        const messages = await Message.find({
          event: eventId,
          $or: [
            { sender: plannerId, receiver: clientId },
            { sender: clientId, receiver: plannerId }
          ]
        }).sort({ timestamp: 1 });
    
        // Map the messages to match our schema
        return messages.map(msg => ({
          id: msg._id.toString(),
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          senderModel: msg.senderModel,
          senderId: msg.sender.toString(), // Convert ObjectId to string
          receiverId: msg.receiver.toString(), // Convert ObjectId to string
          receiverModel: msg.receiverModel,
          eventId: msg.event.toString() // Convert ObjectId to string
        }));
      } catch (error) {
        console.error('Error in getMessages:', error);
        throw new Error('Failed to fetch messages: ' + error.message);
      }
    },
    
    users: async () => await User.find(),
    user: async (parent, { id }) => User.findById(id),
    clients: async () => {
      const clients = await Client.find().populate('planner').populate('events');
      return clients.map(client => ({
        id: client._id.toString(),
        name: client.name,
        planner: client.planner || null,
        events: client.events || [],
        notes: client.notes || [],
        requestList: client.requestList || [],
        actionedRequestList: client.actionedRequestList || []
      }));
    },
    client: async (parent, { id }) => {
      const client = await Client.findById(id).populate('planner').populate('events');
      if (!client) throw new Error('Client not found');
      return {
        id: client._id.toString(),
        name: client.name,
        planner: client.planner || null,
        events: client.events || [],
        notes: client.notes || [],
        requestList: client.requestList || [],
        actionedRequestList: client.actionedRequestList || []
      };
    },

    events: async () => {
      try {
        return await Event.find().populate('planner').populate('clients');
      } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events: ' + error.message);
      }
    },
    event: async (parent, { id }) => {
      try {
        return await Event.findById(id).populate('planner').populate('clients');
      } catch (error) {
        console.error('Error fetching event:', error);
        throw new Error('Failed to fetch event: ' + error.message);
      }
    },
  },

  Mutation: {
    createUser: async (parent, args) => {
      const { username, email, password, role } = args;

      const user = new User({
        username,
        email,
        password, // Pass raw password, bcrypt will handle hashing in the pre-save middleware
        role,
      });

      const savedUser = await user.save();

      console.log('User created successfully:', savedUser);

      return savedUser;
    },
    
    createClient: async (parent, { name, email, phone, password, plannerId, eventId }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = new User({
        username: name,
        email,
        password, // Pass raw password, bcrypt will handle hashing in the pre-save middleware
        role: 'Client',
      });
      const savedUser = await user.save();

      const client = new Client({
        name,
        planner: plannerId || null,
        events: eventId ? [eventId] : [],
      });
      const savedClient = await client.save();

      return {
        user: savedUser,
        client: savedClient,
      };
    },

    createPlanner: async (parent, { name, email, password }) => {
      try {
        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists');
        }
    
        // Create a new user for the planner
        const user = new User({
          username: name,
          email,
          password, // Password is hashed by bcrypt in pre-save middleware
          role: 'Planner', // Assign the role 'Planner'
        });
        const savedUser = await user.save();
    
        // Create the planner and link it to the new user
        const planner = new Planner({
          name, // Planner name (same as username)
          user: savedUser._id, // Link planner to the user
        });
        const savedPlanner = await planner.save();
    
        // Return both the newly created user and planner
        return {
          user: savedUser,
          planner: savedPlanner,
        };
      } catch (error) {
        console.error('Error creating planner:', error);
        throw new Error('Failed to create planner: ' + error.message);
      }
    },
    
    sendMessage: async (parent, { senderId, senderModel, receiverId, receiverModel, eventId, content }) => {
      try {
        console.log('Sending message with params:', { senderId, senderModel, receiverId, receiverModel, eventId });
    
        let actualSenderId = senderId; // Keep the original senderId
        let actualReceiverId = receiverId; // Keep the original receiverId
    
        // If sender is Client, just verify the client exists
        if (senderModel === 'Client') {
          const client = await Client.findOne({
            $or: [
              { _id: senderId },
              { user: senderId }
            ]
          });
    
          if (!client) {
            throw new Error('Sender client not found');
          }
          
          console.log('Verified sender client:', client);
        } else if (senderModel === 'Planner') {
          // If sender is Planner, verify the planner exists
          const planner = await Planner.findOne({
            $or: [
              { _id: senderId },
              { user: senderId }
            ]
          });
    
          if (!planner) {
            throw new Error('Sender planner not found');
          }
    
          console.log('Verified sender planner:', planner);
        }
    
        // Create and save the message
        const message = new Message({
          sender: actualSenderId,
          senderModel,
          receiver: actualReceiverId,
          receiverModel,
          event: eventId,
          content
        });
    
        const savedMessage = await message.save();
        console.log('Message saved:', savedMessage);
    
        return savedMessage;
      } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message: ' + error.message);
      }
    },

    assignClientToPlannerAndEvent: async (parent, { clientId, plannerId, eventId }) => {
      try {
        const client = await Client.findById(clientId).populate('planner').populate('events');
        if (!client) throw new Error('Client not found');

        if (plannerId) {
          const planner = await User.findById(plannerId);
          if (!planner) throw new Error('Planner not found');
          client.planner = plannerId;
        }

        if (eventId) {
          const event = await Event.findById(eventId);
          if (!event) throw new Error('Event not found');
          const eventExists = client.events.some(e => e.toString() === eventId);
          if (!eventExists) {
            client.events.push(eventId);
          }
        }

        const savedClient = await client.save();
        const populatedClient = await Client.findById(savedClient._id).populate('planner').populate('events');
        return {
          id: populatedClient._id.toString(),
          name: populatedClient.name,
          planner: populatedClient.planner ? { id: populatedClient.planner._id.toString(), username: populatedClient.planner.username } : null,
          events: populatedClient.events.map(event => ({ id: event._id.toString(), name: event.name })),
        };
      } catch (error) {
        console.error('Failed to assign client to planner and event:', error);
        throw new Error('Failed to assign client to planner and event: ' + error.message);
      }
    },

    login: async (parent, { email, password }) => {
      try {
        console.log('Login attempt for email:', email);
        const user = await authenticateUser(email, password);
        console.log('User authenticated:', user);

        let associatedEntity = null;
        if (user.role === 'Client') {
          associatedEntity = await Client.findOne({ name: user.username });
          console.log('Associated Client:', associatedEntity);
        } else if (user.role === 'Planner') {
          associatedEntity = await Planner.findOne({ name: user.username });
          console.log('Associated Planner:', associatedEntity);
        }

        if (!associatedEntity) {
          console.warn(`No associated ${user.role} entity found for user:`, user.username);
        }

        const token = signToken(user);
        console.log('Token generated for user');

        return {
          token,
          user: {
            ...user.toObject(),
            id: user._id,
          },
          client: user.role === 'Client' ? associatedEntity : null,
          planner: user.role === 'Planner' ? associatedEntity : null,
        };
      } catch (error) {
        console.error('Login error:', error);
        throw new AuthenticationError('Invalid email or password');
      }
    },

    createEvent: async (parent, { name, description, startDate, endDate, location, plannerId, clientId }) => {
      try {
        const newEvent = new Event({
          name,
          description,
          startDate,
          endDate,
          location,
          planner: plannerId,
          clients: clientId ? [clientId] : [],
        });

        const savedEvent = await newEvent.save();
        const populatedEvent = await Event.findById(savedEvent._id).populate('planner').populate('clients');

        return populatedEvent;
      } catch (error) {
        console.error('Error creating event:', error);
        throw new Error('Failed to create event: ' + error.message);
      }
    },
  },

  Message: {
    id: (parent) => parent.id,
    senderId: (parent) => parent.senderId,
    receiverId: (parent) => parent.receiverId,
    eventId: (parent) => parent.eventId,
    content: (parent) => parent.content,
    timestamp: (parent) => parent.timestamp,
    senderModel: (parent) => parent.senderModel,
    receiverModel: (parent) => parent.receiverModel,
  },

  User: {
    events: async (user) => await Event.find({ planner: user.id }),
  },

  Event: {
    planner: async (event) => await User.findById(event.planner),
  },
};

export default resolvers;