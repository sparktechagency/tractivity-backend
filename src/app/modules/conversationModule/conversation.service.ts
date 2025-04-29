import mongoose from 'mongoose';
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

// service for retrive specific conversation by receiverId
const retriveConversationByReceiverId = async (receiverId: string) => {
  return await Conversation.findOne({
    'receiver.receiverId': receiverId,
  });
};

// service for retrive specific conversation by conversationId
const retriveConversationByConversationId = async (conversationId: string) => {
  return await Conversation.findOne({ _id: conversationId });
};

// service for retrive all conversations by user (sender/receiver)
const retriveConversationsBySpecificUser = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const conversations = await Conversation.aggregate([
    // Populate sender
    {
      $lookup: {
        from: 'users',
        localField: 'sender.senderId',
        foreignField: '_id',
        as: 'senderUser',
      },
    },
    { $unwind: { path: '$senderUser', preserveNullAndEmptyArrays: true } },

    // Populate receiver as user
    {
      $lookup: {
        from: 'users',
        localField: 'receiver.receiverId',
        foreignField: '_id',
        as: 'receiverUser',
      },
    },
    // Populate receiver as event
    {
      $lookup: {
        from: 'events',
        localField: 'receiver.receiverId',
        foreignField: '_id',
        as: 'receiverEvent',
      },
    },
    // Populate lastMessage
    {
      $lookup: {
        from: 'messages',
        localField: 'lastMessage',
        foreignField: '_id',
        as: 'lastMessageInfo',
      },
    },
    { $unwind: { path: '$lastMessageInfo', preserveNullAndEmptyArrays: true } },

    // NEW: Populate roomMemberships
    {
      $lookup: {
        from: 'roommemberships', // Note: collection name is usually lowercased plural automatically
        let: { conversationId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$roomId', { $toString: '$$conversationId' }] },
                  { $eq: ['$userId', userId] }, // userId is string
                ],
              },
            },
          },
        ],
        as: 'roomMemberships',
      },
    },

    // Now match conversations
    {
      $match: {
        $or: [
          { 'sender.senderId': userObjectId },
          { 'receiver.receiverId': userObjectId },
          { 'receiverEvent.joinedVolunteer.volunteer': userObjectId },
          { 'roomMemberships': { $ne: [] } }, // if user found in roomMembership
        ],
      },
    },

    // Reshape sender and receiver
    {
      $addFields: {
        'sender.senderId': {
          _id: '$senderUser._id',
          fullName: '$senderUser.fullName',
          profession: '$senderUser.profession',
          image: '$senderUser.image',
        },
        'receiver.receiverId': {
          $cond: {
            if: { $gt: [{ $size: '$receiverUser' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$receiverUser._id', 0] },
              fullName: { $arrayElemAt: ['$receiverUser.fullName', 0] },
              profession: { $arrayElemAt: ['$receiverUser.profession', 0] },
              image: { $arrayElemAt: ['$receiverUser.image', 0] },
            },
            else: {
              _id: { $arrayElemAt: ['$receiverEvent._id', 0] },
              name: { $arrayElemAt: ['$receiverEvent.name', 0] },
              images: { $arrayElemAt: ['$receiverEvent.images', 0] },
            },
          },
        },
        lastMessage: '$lastMessageInfo',
      },
    },

    // Final project
    {
      $project: {
        sender: 1,
        receiver: 1,
        type: 1,
        lastMessage: 1,
        memberCounts: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return conversations;
};

const retriveConversationsBySpecificUserWithoutPopulate = async (userId: string) => {
  return await Conversation.find({ $or: [{ 'sender.senderId': userId }, { 'receiver.receiverId': userId }] });
};

// service for retrive conversation by sender and conversationid
const retriveConversationBySenderAndConversationId = async (senderId: string, conversationId: string) => {
  return await Conversation.findOne({
    $or: [
      { 'sender.senderId': senderId, _id: conversationId },
      { 'receiver.receiverId': senderId, _id: conversationId }
    ]
  });
};

export default {
  createConversation,
  retriveConversationBySenderIdAndReceiverId,
  retriveConversationByReceiverId,
  retriveConversationByConversationId,
  retriveConversationsBySpecificUser,
  retriveConversationsBySpecificUserWithoutPopulate,
  retriveConversationBySenderAndConversationId,
};

