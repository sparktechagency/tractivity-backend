import { IConversation } from './conversation.interface';
import Conversation from './conversation.model';

// service for create new conversation
const createConversation = async (data: Partial<IConversation>) => {
  return await Conversation.create(data);
};

// service for retrive specific conversation by senderId and receiverId
const retriveConversationBySenderIdAndReceiverId = async (senderId: string, receiverId: string) => {
  return await Conversation.findOne({
    $or: [
      { 'sender.senderId': senderId, 'receiver.receiverId': receiverId },
      { 'sender.senderId': receiverId, 'receiver.receiverId': senderId }, // Handle bidirectional conversations
    ],
  });
};

// service for retrive specific conversation by conversationId
const retriveConversationByConversationId = async (conversationId: string) => {
  return await Conversation.findOne({ _id: conversationId });
};

// service for retrive all conversations by user (sender/receiver)
const retriveConversationsBySpecificUser = async (userId: string) => {
  return await Conversation.find({ $or: [{ 'sender.senderId': userId }, { 'receiver.receiverId': userId }] }).populate([
    {
      path: 'sender.senderId',
      select: 'fullName image profession',
    },
    {
      path: 'receiver.receiverId',
      select: 'fullName image profession',
    },
    {
      path: 'lastMessage',
      select: '',
    },
  ]);
};

export default {
  createConversation,
  retriveConversationBySenderIdAndReceiverId,
  retriveConversationByConversationId,
  retriveConversationsBySpecificUser,
};
