import RoomMembership from './roomMembership.model';

// Add user to a room
export async function addUserToRoom(userId: string, roomId: string): Promise<void> {
  const existingMembership = await RoomMembership.findOne({ userId, roomId });
  if (!existingMembership) {
    await RoomMembership.create({ userId, roomId });
  }
}

// Remove user from a room
export async function removeUserFromRoom(userId: string, roomId: string): Promise<void> {
  await RoomMembership.deleteOne({ userId, roomId });
}

// Get all rooms a user belongs to
export async function getUserRooms(userId: string): Promise<string[]> {
  const memberships = await RoomMembership.find({ userId });
  return memberships.map((membership) => membership.roomId);
}
