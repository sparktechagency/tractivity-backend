import { Server as SocketIOServer, Socket } from 'socket.io';
import { ObjectId } from 'mongoose';
import { IConversation } from '../modules/conversationModule/conversation.interface';
import { IMessage } from '../modules/messageModule/message.interface';
import { getUserRooms } from '../modules/roomMembershipModule/roomMembership.utils';

interface ConnectedUsers {
  [userId: string]: string; // Maps userId to socketId
}

interface ConnectedAdmins {
  [userId: string]: string; // Maps userId to socketId
}

interface UserRooms {
  [userId: string]: Set<string>; // Maps userId to a set of room IDs
}

class SocketManager {
  private static instance: SocketManager;
  private io!: SocketIOServer;
  private connectedUsers: ConnectedUsers = {};
  private userRooms: UserRooms = {};
  private activeAppUsers: string[] = [];
  //   private connectedAdmins: ConnectedAdmins = {};
  //   private activeAdmins: string[] = [];

  private constructor() {}

  // Singleton instance getter
  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // Initialize the Socket.IO server
  init(io: SocketIOServer): void {
    this.io = io;

    io.on('connection', async (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      const userId = socket.handshake.query.userId as string | undefined;
      //   const adminId = socket.handshake.query.adminId as string | undefined;

      if (userId) {
        this.connectedUsers[userId] = socket.id;

        if (!this.activeAppUsers.includes(userId)) {
          this.activeAppUsers.push(userId);
        }

        // Rejoin user to their rooms
        const rooms = await getUserRooms(userId);
        for (const roomId of rooms) {
          socket.join(roomId);
          console.log(`User ${userId} rejoined room ${roomId}`);
        }
      }
      //   if (adminId) {
      //     this.connectedAdmins[adminId] = socket.id;

      //     if (!this.activeAdmins.includes(adminId)) {
      //       this.activeAdmins.push(adminId);
      //     }
      //   }

      console.log('connected users: ', this.connectedUsers);
      console.log('active users: ', this.activeAppUsers);
      //   console.log("connected Admins: ", this.connectedAdmins);
      //   console.log("active Admins: ", this.activeAdmins);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // Remove the user from connectedUsers and activeAppUsers
        for (const id in this.connectedUsers) {
          if (this.connectedUsers[id] === socket.id) {
            delete this.connectedUsers[id];
            const index = this.activeAppUsers.indexOf(id);
            if (index !== -1) {
              this.activeAppUsers.splice(index, 1);
            }
            break;
          }
        }
        console.log(this.connectedUsers);
        console.log(this.activeAppUsers);
      });
    });
  }

  // Join both sender and receiver to a conversation room
  joinDirectUserOrCreateOnlyRoom(conversation: Partial<IConversation>): void {
    if (!conversation._id || !conversation.sender?.senderId || !conversation.receiver?.receiverId) {
      console.warn('Invalid conversation data provided to joinUser in socket!');
      throw new Error('Invalid conversation data provided to joinUser in socket!');
    }

    const room = conversation._id.toString();

    if (conversation.type === 'direct') {
      // Add sender to the room
      const senderId = conversation.sender.senderId;
      if (senderId && this.connectedUsers[senderId]) {
        const socketId = this.connectedUsers[senderId];
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(room);
          console.log(`Sender ${conversation.sender.name} joined conversation ${room}`);
        }
      } else {
        console.warn(`Sender ${conversation.sender?.name || ''} is not connected`);
      }

      // Add receiver to the room (if connected)
      const receiverId = conversation.receiver.receiverId;
      if (receiverId && this.connectedUsers[receiverId]) {
        const socketId = this.connectedUsers[receiverId];
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(room);
          console.log(`Receiver ${conversation.receiver.name} joined conversation ${room}`);
        }
      } else {
        console.warn(`Receiver ${conversation.receiver?.name || ''} is not connected. They will join the room when they connect.`);
      }
    } else {
      // For group conversations, just create a room using the conversation ID
      const participants = this.io.sockets.adapter.rooms.get(room);
      console.log(participants);
      if (!participants) {
        this.io.sockets.adapter.rooms.set(room, new Set());
        console.log(`Room ${room} created for group conversation.`);
      } else {
        console.log(`Room ${room} already exists with ${participants.size} participants.`);
      }
    }
  }

  // method for join specific group user to a conversation
  joinUserToARoom(conversationId: string, userId: string): void {
    if (!conversationId && !userId) {
      console.warn('Invalid conversation ID or user ID provided to joinGroupUser  function!');
      throw new Error('Invalid conversation ID or user ID provided to joinGroupUser function!');
    }

    const room = conversationId.toString();

    const socketId = this.connectedUsers[userId];
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(room);
      console.log(`User ${userId} joined conversation ${room}`);
    } else {
      console.warn(`User ${userId} is not connected to group conversation.`);
    }
  }

  // send and broadcast messages to all users in specific conversation
  sendMessage(conversationId: string | ObjectId, message: Partial<IMessage>): void {
    if (!conversationId || !message) {
      console.warn('Invalid message data provided to sendMessage function!');
      throw new Error('Invalid message data provided to sendMessage function!');
    }

    const roomId = conversationId.toString(); // Ensure roomId is a string
    const room = this.io.sockets.adapter.rooms.get(roomId);
    console.log(roomId, room);
    if (room && room.size > 0) {
      // Check if the room exists and has members
      this.io.to(roomId).emit('newMessage', message);
      console.log(`Message sent in conversation ${roomId}`);
      // Notify all admins globally
      // this.io.emit('newMessageForAdmins', message);
    } else {
      console.warn(`Room ${roomId} does not exist or has no participants`);
    }
  }
}

export default SocketManager;
