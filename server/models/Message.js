import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the schema for the Message model
const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    refPath: 'senderModel', // Reference to either Client or Planner model
    required: true,
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Client', 'Planner'], // Can be either Client or Planner
  },
  receiver: {
    type: Schema.Types.ObjectId,
    refPath: 'receiverModel', // Reference to either Client or Planner model
    required: true,
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['Client', 'Planner'], // Can be either Client or Planner
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event', // Reference to the Event model
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create the Message model
const Message = mongoose.model('Message', messageSchema);

export default Message;