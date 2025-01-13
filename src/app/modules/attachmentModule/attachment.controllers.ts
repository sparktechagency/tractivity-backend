import { Request, Response } from 'express';
import Attachment from './attachment.model';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// controller for get all attachment of a conversation
const retriveAttachmentByConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const attachments = await Attachment.find({ conversation: conversationId }).sort('-createdAt');

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: `Attachments retrive successfull`,
    data: attachments,
  });
};

export default {
  retriveAttachmentByConversation,
};
