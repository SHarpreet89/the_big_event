const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Correctly referencing User
const Event = require("../models/Event");
const bcrypt = require("bcrypt");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) throw new Error("Not authenticated");
      return User.findById(context.user.id); // Correctly retrieving the authenticated user
    },
    users: async () => await User.find(), // Changed planners to users
    user: async (parent, { id }) => await User.findById(id), // Correctly updated to User
    events: async () => await Event.find().populate("planner"), // Make sure 'planner' references the User in your Event model
    event: async (parent, { id }) => await Event.findById(id).populate("planner"), // Same as above
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ // Correctly creating a User
        username,
        email,
        password: hashedPassword,
      });
      return user.save(); // Saving the User
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email }); // Searching for User
      if (!user) {
        throw new Error("User not found"); // Error if User doesn't exist
      }
      const isValid = await bcrypt.compare(password, user.password); // Validating password
      if (!isValid) {
        throw new Error("Invalid password");
      }
      return jwt.sign(
        { id: user.id }, // Correctly returning the user ID
        process.env.JWT_SECRET || "somesupersecretkey",
        { expiresIn: "1h" }
      );
    },
    createEvent: async (parent, { title, description, startDate, endDate, plannerId }) => {
      console.log("Planner ID:", plannerId); // Log to ensure it is defined
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
    events: async (user) => await Event.find({ planner: user.id }), // Ensure this aligns with your Event model
  },

  Event: {
    planner: async (event) => await User.findById(event.planner), // Ensure this aligns with your Event model
  },
};

module.exports = resolvers;