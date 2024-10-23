import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the schema for the Planner model
const plannerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event', // Reference to the Event model
    },
  ],
  clients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Client', // Reference to the Client model
    },
  ],
});


// Static method to add an event to a planner
plannerSchema.statics.addEvent = async function(plannerId, eventId) {
  const planner = await this.findById(plannerId);
  if (!planner) {
    throw new Error('Planner not found');
  }

  const eventExists = planner.events.some(event => event.toString() === eventId.toString());
  if (!eventExists) {
    planner.events.push(eventId);
    await planner.save();
  } else {
    console.log(`Event ${eventId} is already assigned to planner ${plannerId}`);
  }

  return planner;
};

// Static method to add a client to a planner
plannerSchema.statics.addClient = async function(plannerId, clientId) {
  const planner = await this.findById(plannerId);
  if (!planner) {
    throw new Error('Planner not found');
  }

  const clientExists = planner.clients.some(client => client.toString() === clientId.toString());
  if (!clientExists) {
    planner.clients.push(clientId);
    await planner.save();
  } else {
    console.log(`Client ${clientId} is already assigned to planner ${plannerId}`);
  }

  return planner;
};

// Create the Planner model
const Planner = mongoose.model('Planner', plannerSchema);

export default Planner;