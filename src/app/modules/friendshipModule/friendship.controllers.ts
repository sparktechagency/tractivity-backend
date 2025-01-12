// controller for create friendsihp

import { Request, Response } from 'express';
import friendshipServices from './friendship.services';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createFriendship = async (req: Request, res: Response) => {
  const friendshipData = req.body;
  const frindship = await friendshipServices.createFriendship(friendshipData);

  if (!frindship) {
    throw new CustomError.BadRequestError('Failed to create new friendship!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Friendship created successfully',
    data: frindship,
  });
};

// controller for get all requested friendship by responder
const getAllRequestedFriendships = async (req: Request, res: Response) => {
  const { responderId } = req.params;
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const requestedFriendships = await friendshipServices.getRequestedFriendshipByResponder(responderId, query as string, skip, limit);

  const totalFrindship = requestedFriendships.length || 0;
  const totalPages = Math.ceil(totalFrindship / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'All requested friendships retrieved successfully',
    meta: {
      totalData: totalFrindship,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: requestedFriendships,
  });
};

// controller for get all friendship by userId
const getAllFriendshipByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const friends = await friendshipServices.getAllFriendshipByUserId(userId, query as string, skip, limit);

  const totalFrinds = friends.length || 0;
  const totalPages = Math.ceil(totalFrinds / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Friends retrieved successfully',
    meta: {
      totalData: totalFrinds,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: friends,
  });
};

// controller for accept friendship
const acceptFriendship = async (req: Request, res: Response) => {
  const { friendshipId } = req.params;

  const updatedFriendship = await friendshipServices.acceptFriendship(friendshipId);

  if (!updatedFriendship?.isModified) {
    throw new CustomError.BadRequestError('Failed to accept friendship!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Friendship accepted',
  });
};

// controller for retrive organic users for invite friendship
const retriveOrganicUsersForInviteFriendship = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { query } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const users = await friendshipServices.retriveOrganicUsersForInviteFriendship(userId, query as string, skip, limit);

  const totalUsers = users.length || 0;
  const totalPages = Math.ceil(totalUsers / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organic users retrieved successfully',
    meta: {
      totalData: totalUsers,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: users,
  });
};

export default {
  createFriendship,
  getAllRequestedFriendships,
  getAllFriendshipByUserId,
  acceptFriendship,
  retriveOrganicUsersForInviteFriendship
};
