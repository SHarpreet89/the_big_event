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

    getMessages: async (parent, { plannerId, clientId }) => {
      try {
        const messages = await Message.find({
          $or: [
            { sender: plannerId, receiver: clientId },
            { sender: clientId, receiver: plannerId }
          ]
        }).sort({ timestamp: 1 }); // Sort by timestamp to show in chronological order
        return messages;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
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
    events: async () => await Event.find().populate('planner'),
    event: async (parent, { id }) => await Event.findById(id).populate('planner'),
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

    sendMessage: async (parent, { senderId, senderModel, receiverId, receiverModel, eventId, content }) => {
      try {
        const message = new Message({
          sender: senderId,
          senderModel,
          receiver: receiverId,
          receiverModel,
          event: eventId,
          content,
        });

        // Save the message
        const savedMessage = await message.save();

        // Return only the saved message without populating any additional data
        return savedMessage;
      } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message: ' + error.message);
      }
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
      const user = await authenticateUser(email, password);
      const token = signToken(user);
      return {
        token,
        user,
      };
    },

    createEvent: async (parent, { name, description, startDate, endDate, location, plannerId, clientId }) => {
      try {
        console.log('Creating event:', { name, description, startDate, endDate, location, plannerId, clientId });
        const existingEvent = await Event.findOne({ name, description, startDate, endDate, location, planner: plannerId });
        if (existingEvent) {
          console.log('Event already exists:', existingEvent);
          return existingEvent;
        }

        const newEvent = new Event({
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
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
    id: (parent) => parent._id.toString(),
    receiverId: (parent) => parent.receiver ? parent.receiver.toString() : null,
    senderId: (parent) => parent.sender ? parent.sender.toString() : null,
  },

  User: {
    events: async (user) => await Event.find({ planner: user.id }),
  },

  Event: {
    planner: async (event) => await User.findById(event.planner),
  },
};

export default resolvers;

