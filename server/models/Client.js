import mongoose from 'mongoose';
const { Schema } = mongoose;

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  planner: {
    type: Schema.Types.ObjectId,
    ref: 'Planner', // Reference to the Planner model
    // Removed the unique: true constraint
  },
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event',
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
        ref: 'Planner',
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
    const Planner = mongoose.model('Planner');

    // If this client already had a planner, remove this client from that planner's clients array
    if (this._original && this._original.planner) {
      await Planner.findByIdAndUpdate(this._original.planner, {
        $pull: { clients: this._id }
      });
    }

    // Add this client to the new planner's clients array
    if (this.planner) {
      await Planner.findByIdAndUpdate(this.planner, {
        $addToSet: { clients: this._id }
      });
    }
  }

  // Check for duplicate event assignments
  if (this.isModified('events')) {
    const uniqueEvents = new Set(this.events.map(event => event.toString()));
    this.events = Array.from(uniqueEvents);
  }

  next();
});

// Store the original state before any modifications
clientSchema.pre('save', function(next) {
  this._original = this.toObject();
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

const Client = mongoose.model('Client', clientSchema);

export default Client;