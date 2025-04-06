import User from '../userModule/user.model';
import { IFriendship } from './friendship.interface';
import Friendship from './friendship.model';

// service for create friendship
const createFriendship = async (data: Partial<IFriendship>) => {
  return await Friendship.create(data);
};

// service for get all requested friendship by responder
const getRequestedFriendshipByResponder = async (responderId: string, searchQuery: string, skip: number, limit: number) => {
  let query: {
    [key: string]: any;
    'responder.responderId': string;
    status: string;
  } = {
    'responder.responderId': responderId,
    status: 'pending',
  };

  if (searchQuery) {
    query['$text'] = { $search: searchQuery };
  }

  return await Friendship.find(query)
    .populate([
        {
          path: 'requester.requesterId',
          select: 'image fullName profession',
        },
        {
          path: 'responder.responderId',
          select: 'image fullName profession',
        },
      ])
    .exec();
};

// service for get all friendship by userId
const getAllFriendshipByUserId = async (userId: string, searchQuery: string, skip: number, limit: number) => {
  const query: any = {
    $or: [{ 'requester.requesterId': userId }, { 'responder.responderId': userId }],
    status: 'accepted',
  };

  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  return await Friendship.find(query)
    .populate([
      {
        path: 'requester.requesterId',
        select: 'image fullName profession',
      },
      {
        path: 'responder.responderId',
        select: 'image fullName profession',
      },
    ])
    .exec();
};

// service for accept friendship
const acceptFriendship = async (friendshipId: string) => {
  const friendship = await Friendship.findOneAndUpdate(
    {
      _id: friendshipId,
    },
    { status: 'accepted' },
    { new: true },
  ).exec();

  return friendship;
};

// service for retrive organic user for invite friendship
const retriveOrganicUsersForInviteFriendship = async (userId: string, searchQuery?: string, skip?: number, limit?: number) => {
  // Step 1: Find all friendships involving the current user with a 'pending' status
  const existingFriendships = await Friendship.find({
    $or: [{ 'requester.requesterId': userId }, { 'responder.responderId': userId }],
    status: { $in: ['pending', 'accepted'] },
  });

  // Step 2: Collect IDs of users who are already part of a pending friendship
  const excludedUserIds = new Set(
    existingFriendships.flatMap((friendship) => [friendship.requester.requesterId.toString(), friendship.responder.responderId.toString()]),
  );

  // Step 3: Build the query to retrieve users not in the excludedUserIds
  const query: any = {
    _id: { $nin: Array.from(excludedUserIds) }, // Exclude users already in pending friendships
  };

  // Step 4: Add text search if searchQuery is provided
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Step 5: Fetch users
  const users = await User.find(query)
    .skip(skip as number)
    .limit(limit as number)
    .select('fullName profession image');

  return users;
};

export default {
  createFriendship,
  getRequestedFriendshipByResponder,
  getAllFriendshipByUserId,
  acceptFriendship,
  retriveOrganicUsersForInviteFriendship,
};
