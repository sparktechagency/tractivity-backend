import mongoose, { mongo } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'conversation'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    type: {
      type: String,
      enum: {
        values: ['text', 'attachment'],
        message: '{VALUE} is not accepted as a message type. Please use text or attachment as a message type.'
      }
    },
    content: {
      type: String,
      validate: {
        validator: function(this: any, value: string) {
          if (this.type === 'attachment'){
            return true
          } 
          return !!value
        },
        message: 'Content is required when type is text.',
      }
    },
    attachment: [{
      type: String,
      default: null
    }],
    // status: {
    //   type: String,
    //   enum: ['sent', 'received', 'read'],
    //   default: 'sent'
    // }
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model<IMessage>('message', messageSchema);
export default Message;
