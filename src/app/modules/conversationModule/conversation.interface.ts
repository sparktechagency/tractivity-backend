import { Document, Types } from 'mongoose';

export interface IConversation extends Document {
  sender: {
    name: string;
    senderId: string;
  };
  receiver: {
    name: string;
    receiverId: string;
  };
  type: string;
  lastMessage: Types.ObjectId | string;
  memberCounts: number
}
