const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  planner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planner', // Reference to the Planner model
    required: true,
  },
  clients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client', // Reference to the Client model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;