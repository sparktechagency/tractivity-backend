import mongoose, { Schema, Document } from 'mongoose';

interface IUserRoom extends Document {
  userId: string; 
  roomId: string; 
}

const UserRoomSchema = new Schema<IUserRoom>({
  userId: { type: String, required: true },
  roomId: { type: String, required: true },
});

const RoomMembership = mongoose.model<IUserRoom>('roomMembership', UserRoomSchema);

export default RoomMembership;
