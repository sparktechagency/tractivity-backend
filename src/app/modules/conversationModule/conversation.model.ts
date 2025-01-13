import mongoose from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    sender: {
      name: {
        type: String,
        required: true,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    },
    receiver: {
      name: {
        type: String,
        required: true,
      },
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    },
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'message',
      default: null,
    },
    memberCounts: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  },
);

const Conversation = mongoose.model<IConversation>('conversation', conversationSchema);
export default Conversation;
