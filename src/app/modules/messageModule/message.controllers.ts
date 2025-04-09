// controller for create new messages inside a conversation

import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import CustomError from '../../errors';
import messageServices from './message.services';
import { Request, Response } from 'express';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import Attachment from '../attachmentModule/attachment.model';
// import createNotification from '../../../utils/notificationCreator';
import conversationService from '../conversationModule/conversation.service';
import { Types } from 'mongoose';
import eventServices from '../eventModule/event.services';
import SocketManager from '../../socket/manager.socket';

const createMessage = async (req: Request, res: Response) => {
  const messageData = req.body;
  const files = req.files;
  const socketManager = SocketManager.getInstance();

  // Validate and sanitize message data
  //   messageData.content = validator.escape(messageData.content);

  const conversation = await conversationService.retriveConversationByConversationId(messageData.conversation);
  if (!conversation) {
    throw new CustomError.BadRequestError('Invalid conversation');
  }

  if (conversation.type === 'direct') {
    if (messageData.sender !== conversation.sender.senderId.toString()) {
      if(messageData.sender !== conversation.receiver.receiverId.toString()){
        throw new CustomError.BadRequestError('You are not authorized to send a message in this conversation!');
      }
    }
  } else {
    const event = await eventServices.retriveSpecificEventByIdWithoutVolunteerPopulation(conversation.receiver.receiverId);

    if (!event) {
      throw new CustomError.BadRequestError('Event not found. You cannot send a message to this group conversation.');
    }

    const isSenderInJoinedVolunteers = event.joinedVolunteer?.some((v) => v.volunteer.toString() === messageData.sender);

    if (!isSenderInJoinedVolunteers) {
      throw new CustomError.BadRequestError('You are not authorized to send a message in this group conversation!');
    }
  }

  if (files && messageData.type !== 'attachment') {
    throw new CustomError.BadRequestError('Please use attachment as message type!');
  }

  if (messageData.type === 'attachment') {
    if (!files || !files.attachment) {
      throw new CustomError.BadRequestError('Missing attachment in request');
    }

    const attachmentPath = await fileUploader(files as FileArray, `${messageData.type}-attachment`, 'attachment');
    messageData.attachment = attachmentPath as string;
  }

  const message = await messageServices.createMessage(messageData);
  let formatedMessage: any;

  if(message){
    formatedMessage = await messageServices.retrieveMessageByMessageId(message._id as string)
  }
  socketManager.sendMessage(messageData.conversation, formatedMessage);

  // const getConversation = await conversationService.retriveConversationByConversationId(messageData.conversation)
  // // create notification for new message
  // if(getConversation){
  //   createNotification(getConversation.user.userId as unknown as Types.ObjectId, getConversation.user.name, `Received new message.`);
  // }

  if (!message) {
    throw new CustomError.BadRequestError('Failed to create message.');
  }

  if (messageData.type === 'text') {
    conversation.lastMessage = message._id as Types.ObjectId;
  }
  // else {
  //   conversation.lastMessage = 'Sent you a attachment' as string;
  // }

  await conversation.save();

  if (messageData.type === 'attachment') {
    const attachmentPayload = {
      conversation: messageData.conversation,
      message: message._id,
      type: messageData.type,
      content: messageData.attachment,
    };

    await Attachment.create(attachmentPayload);
  }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: `Message sended successfull`,
    data: message,
  });
};

// controller for get all messages of a conversation
const retriveMessagesByConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await messageServices.retriveMessages(conversationId);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: `Messages retrive successfull`,
    data: messages,
  });
};

export default {
  createMessage,
  retriveMessagesByConversation,
};
