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

// Create the Planner model
const Planner = mongoose.model('Planner', plannerSchema);

export default Planner;