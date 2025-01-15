import { Server as SocketIOServer, Socket } from 'socket.io';

import SocketManager from './manager.socket';
import { IConversation } from '../modules/conversationModule/conversation.interface';

interface ConnectedUsers {
  [userId: string]: string; // Maps userId to socketId
}

const connectedUsers: ConnectedUsers = {};
const activeAppUsers: string[] = [];
let joinUser: (conversation: Partial<IConversation>) => void;

// const configSocket = (io: SocketIOServer): void => {
//   io.on('connection', (socket: Socket) => {
//     console.log(`User connected: ${socket.id}`);

//     const userId = socket.handshake.query.userId as string | undefined;

//     if (userId) {
//       connectedUsers[userId] = socket.id;

//       if (!activeAppUsers.includes(userId)) {
//         activeAppUsers.push(userId);
//       }
//     }

//     console.log(connectedUsers);
//     console.log(activeAppUsers);

//     // Perform socket operations here..........................................
//     joinUser = (conversation: Partial<IConversation>) => {
//       if (!conversation._id || !conversation.user?.name) {
//         console.warn('Invalid conversation data provided to joinUser in socket!');
//         throw new CustomError.BadRequestError('Invalid conversation data provided to joinUser in socket!')
//       }

//       socket.join(conversation._id as string);
//       console.log(`User ${conversation.user.name} joined conversation ${conversation._id}`);
//     };

//     // socket disconnect event
//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.id}`);

//       // Remove the user from connectedUsers and activeAppUsers
//       for (const id in connectedUsers) {
//         if (connectedUsers[id] === socket.id) {
//           delete connectedUsers[id];
//           const index = activeAppUsers.indexOf(id);
//           if (index !== -1) {
//             activeAppUsers.splice(index, 1);
//           }
//           break;
//         }
//       }
//       console.log(connectedUsers);
//       console.log(activeAppUsers);
//     });
//   });
// };

const configSocket = (io: SocketIOServer): void => {
  const socketManager = SocketManager.getInstance();
  socketManager.init(io);
};

export default configSocket;
