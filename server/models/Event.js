import mongoose from 'mongoose';

const subeventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
  },
  planner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planner',
  },
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
  subevents: [subeventSchema], // Add subevents field
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;