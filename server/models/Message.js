import mongoose from 'mongoose';
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Client', 'Planner']
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['Client', 'Planner']
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
