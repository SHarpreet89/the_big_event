// models/Client.js
import mongoose from 'mongoose';
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
    unique: true,
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

// Pre-save middleware to handle planner assignment
clientSchema.pre('save', async function(next) {
  if (this.isModified('planner')) {
    const Client = mongoose.model('Client');
    
    // Check if the new planner is already assigned to another client
    const clientWithPlanner = await Client.findOne({ planner: this.planner });
    
    if (clientWithPlanner && clientWithPlanner._id.toString() !== this._id.toString()) {
      // Swap planners
      const oldPlanner = clientWithPlanner.planner;
      clientWithPlanner.planner = this.planner;
      this.planner = oldPlanner;
      
      await clientWithPlanner.save();
    }
  }

  // New middleware to check for duplicate event assignments
  if (this.isModified('events')) {
    const uniqueEvents = new Set(this.events.map(event => event.toString()));
    this.events = Array.from(uniqueEvents);
  }

  next();
});

// Create a static method to add an event to a client
clientSchema.statics.addEvent = async function(clientId, eventId) {
  const client = await this.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  const eventExists = client.events.some(event => event.toString() === eventId.toString());
  if (!eventExists) {
    client.events.push(eventId);
    await client.save();
  } else {
    console.log(`Event ${eventId} is already assigned to client ${clientId}`);
  }

  return client;
};

// Create the Client model
const Client = mongoose.model('Client', clientSchema);

export default Client;