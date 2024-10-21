// models/Client.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the Client model
const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  planner: {
    type: Schema.Types.ObjectId,
    ref: 'Planner', // Reference to the Planner model
  },
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event', // Reference to the Event model
    },
  ],
  notes: [
    {
      type: String,
    },
  ],
  requestList: [
    {
      item: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  actionedRequestList: [
    {
      item: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['approved', 'rejected'],
        required: true,
      },
      actionedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Planner', // Reference to the Planner model who actioned the request
      },
      actionedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Create the Client model
const Client = mongoose.model('Client', clientSchema);

module.exports = Client;