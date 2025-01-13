import { Request, Response } from 'express';
import conversationService from './conversation.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
// import SocketManager from '../../../socket/manager.socket';
// import createNotification from '../../../utils/notificationCreator';

// controller for create new conversation
const createConversation = async (req: Request, res: Response) => {
  const conversationData = req.body;
  // const socketManager = SocketManager.getInstance();
  const existConversation = await conversationService.retriveConversationBySenderIdAndReceiverId(conversationData.sender.senderId, conversationData.receiver.receiverId);
  if (existConversation) {
    // function for cratea and join user using conversationId
    // socketManager.joinUser(existConversation);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: `Conversation retrive successfull`,
      data: existConversation,
    });
  } else {
    const conversation = await conversationService.createConversation(conversationData);

    if (!conversation) {
      throw new CustomError.BadRequestError('Failed to create conversation!');
    }

    // function for cratea and join user using conversationId
    // socketManager.joinUser(conversation);

    // create notification for new conversation
    // createNotification(conversationData.user.userId, conversationData.user.name, `New conversation created.`);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: `Conversation created successfull`,
      data: conversation,
    });
  }
};

// controller for get all conversation by user (sender/receiver)
const retriveConversationsBySpecificUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const conversations = await conversationService.retriveConversationsBySpecificUser(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: `Conversations retrive successful!`,
    data: conversations,
  });
};

export default {
  createConversation,
  retriveConversationsBySpecificUser,
};
