import mongoose from 'mongoose';
import { IFriendship } from './friendship.interface';

const friendshipSchema = new mongoose.Schema<IFriendship>(
  {
    requester: {
      requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      name: {
        type: String,
        required: true,
      },
    },
    responder: {
      responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      name: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    // versionKey: false
  },
);

friendshipSchema.index({
    'responder.name': 'text',  
    'requester.name': 'text'  
  });
  

const Friendship = mongoose.model<IFriendship>('friendship', friendshipSchema);
export default Friendship;
