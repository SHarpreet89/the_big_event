const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");
const bcrypt = require("bcrypt");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) throw new Error("Not authenticated");
      return User.findById(context.user.id);
    },
    users: async () => await User.find(),
    user: async (parent, { id }) => await User.findById(id),
    events: async () => await Event.find().populate("planner"),
    event: async (parent, { id }) => await Event.findById(id).populate("planner"),
  },

  Mutation: {
    createUser: async (parent, { username, email, password, role }) => {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
      });
      return user.save();
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error("Invalid password");
      }
    
      // Generate token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "somesupersecretkey",
        { expiresIn: "1h" }
      );
    
      return {
        token, // Return token
        user,  // Return user details
      };
    },
    createEvent: async (parent, { title, description, startDate, endDate, plannerId }) => {
      const user = await User.findById(plannerId);
      if (!user) throw new Error("User not found");
      const event = new Event({
        title,
        description,
        startDate,
        endDate,
        planner: user.id,
      });
      return event.save();
    },
  },

  User: {
    events: async (user) => await Event.find({ planner: user.id }),
  },

  Event: {
    planner: async (event) => await User.findById(event.planner),
  },
};

module.exports = resolvers;
