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

// Pre-save hook to check for duplicate messages within one minute
messageSchema.pre('save', async function (next) {
  const message = this;
  const oneMinuteAgo = new Date(message.timestamp.getTime() - 60000); // 60000 ms = 1 minute

  try {
    const existingMessage = await Message.findOne({
      content: message.content,
      timestamp: { $gte: oneMinuteAgo, $lte: message.timestamp }
    });

    if (existingMessage) {
      const error = new Error('Duplicate message detected within one minute');
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;