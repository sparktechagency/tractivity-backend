import Organization from '../organizationModule/organization.model';
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
const retriveOrganicUsersForInviteFriendship = async (
  userId: string,
  searchQuery?: string,
  skip: number = 0,
  limit: number = 10
) => {
  // Step 1: Find organizations where the user is creator or connected volunteer
  const relatedOrganizations = await Organization.find({
    $or: [
      { 'creator.creatorId': userId },
      { connectedVolunteers: userId },
    ],
  });

  // Step 2: Get all connected user IDs from these organizations (excluding the current user)
  const connectedUserIds = new Set<string>();

  for (const org of relatedOrganizations) {
    if (org.creator?.creatorId?.toString() !== userId) {
      connectedUserIds.add(org.creator.creatorId.toString());
    }

    org.connectedVolunteers.forEach((volunteerId: any) => {
      if (volunteerId.toString() !== userId) {
        connectedUserIds.add(volunteerId.toString());
      }
    });
  }

  // Step 3: Find existing friendships (pending or accepted) involving current user
  const existingFriendships = await Friendship.find({
    $or: [
      { 'requester.requesterId': userId },
      { 'responder.responderId': userId },
    ],
    status: { $in: ['pending', 'accepted'] },
  });

  // Step 4: Exclude users already in a pending or accepted friendship
  const excludedUserIds = new Set(
    existingFriendships.flatMap((f) => [
      f.requester.requesterId.toString(),
      f.responder.responderId.toString(),
    ])
  );

  // Step 5: Filter only users who are connected in orgs but not yet friends
  const finalUserIds = [...connectedUserIds].filter(
    (id) => !excludedUserIds.has(id)
  );

  // Step 6: Build user query
  const query: any = {
    _id: { $in: finalUserIds },
  };

  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
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
