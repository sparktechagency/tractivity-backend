import { Request, Response } from 'express';
import conversationService from './conversation.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import SocketManager from '../../socket/manager.socket';
import mongoose from 'mongoose';
import { IConversation } from './conversation.interface';
import RoomMembership from '../roomMembershipModule/roomMembership.model';
// import createNotification from '../../../utils/notificationCreator';

// controller for create new conversation
// const createConversation = async (req: Request, res: Response) => {
//   const conversationData = req.body;
//   const socketManager = SocketManager.getInstance();
//   let existConversation;
//   if(conversationData.type === 'direct'){
//     existConversation = await conversationService.retriveConversationBySenderIdAndReceiverId(conversationData.sender.senderId, conversationData.receiver.receiverId);
//   }else{
//     console.log('group')
//     const existGroupConversation = await conversationService.retriveConversationByReceiverId(conversationData.receiver.receiverId);
//     if(!existGroupConversation){
//       const conversation = await conversationService.createConversation(conversationData);
//       conversation._id = conversationData.receiver.receiverId
//     } // for group
//   }

//   if (existConversation) {
//     // function for cratea and join user using conversationId
//     socketManager.joinDirectUserOrCreateOnlyRoom(existConversation);

//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       status: 'success',
//       message: `Conversation retrive successfull`,
//       data: existConversation,
//     });
//   } else {
//     const conversation = await conversationService.createConversation(conversationData);

//     if (!conversation) {
//       throw new CustomError.BadRequestError('Failed to create conversation!');
//     }

//     // function for cratea and join user using conversationId
//     socketManager.joinDirectUserOrCreateOnlyRoom(conversation);

//     // create notification for new conversation
//     // createNotification(conversationData.user.userId, conversationData.user.name, `New conversation created.`);

//     sendResponse(res, {
//       statusCode: StatusCodes.CREATED,
//       status: 'success',
//       message: `Conversation created successfull`,
//       data: conversation,
//     });
//   }
// };
const createConversation = async (req: Request, res: Response) => {
  const conversationData = req.body;
  const socketManager = SocketManager.getInstance();

  let existingConversation;

  // Handle direct conversation type
  if (conversationData.type === 'direct') {
    existingConversation = await conversationService.retriveConversationBySenderIdAndReceiverId(
      conversationData.sender.senderId,
      conversationData.receiver.receiverId,
    );

    if (!existingConversation) {
      existingConversation = await conversationService.createConversation(conversationData);
    }
  } else if (conversationData.type === 'group') {
    // Handle group conversation type
    existingConversation = await conversationService.retriveConversationByReceiverId(conversationData.receiver.receiverId);

    if (!existingConversation) {
      // Create a new conversation with receiverId as _id
      const newConversationData = {
        ...conversationData,
        _id: new mongoose.Types.ObjectId(conversationData.receiver.receiverId),
      };

      existingConversation = await conversationService.createConversation(newConversationData);

      if (!existingConversation) {
        throw new CustomError.BadRequestError('Failed to create group conversation!');
      }
    }
  } else {
    throw new CustomError.BadRequestError('Invalid conversation type!');
  }

  console.log(existingConversation);

  // Join or create room for the conversation
  socketManager.joinDirectUserOrCreateOnlyRoom(existingConversation as Partial<IConversation>);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: existingConversation ? 'Conversation retrieved successfully' : 'Conversation created successfully',
    data: existingConversation,
  });
};

// controller for get all conversation by user (sender/receiver)
const retriveConversationsBySpecificUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const conversations = await conversationService.retriveConversationsBySpecificUser(userId);

  let responseConversations: any[] = [];

  await Promise.all(
    conversations.map(async (conversation: any) => {
      const convoObj = conversation.toObject?.() || { ...conversation }; // handle Mongoose documents
      // console.log(convoObj)

      if (convoObj.type === 'group') {
        const usersInRoom = await RoomMembership.find({ roomId: convoObj._id });

        if (usersInRoom.length > 0) {
          convoObj.conversationMembers = usersInRoom.map((u) => u.userId);
        }
      }

      // console.log(convoObj)
      responseConversations.push(convoObj);
    })
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Conversations retrieved successfully!`,
    data: responseConversations,
  });
};



export default {
  createConversation,
  retriveConversationsBySpecificUser,
};
