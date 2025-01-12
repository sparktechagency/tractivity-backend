import { Request, Response } from 'express';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import userServices from '../userModule/user.services';
import missionServices from './mission.services';
import Invitation from '../invitationModule/invitation.model';
import User from '../userModule/user.model';
import Organization from '../organizationModule/organization.model';

// controller for create mission
const createMission = async (req: Request, res: Response) => {
  const missionData = req.body;

  const creator = await userServices.getSpecificUser(missionData.creatorId);
  if (!creator) {
    throw new CustomError.BadRequestError('No creator found by the creatorId!');
  }

  // check the creator has administrator permission
  if (!creator.roles.includes('administrator')) {
    throw new CustomError.BadRequestError('Creator does not have administrator permission!');
  }

  if (missionData.connectedOrganizations.length === 0) {
    throw new CustomError.BadRequestError('You must add at least one organization!');
  }

  if (missionData.requestedOrganizers.length === 0) {
    throw new CustomError.BadRequestError('You must add at least one leader/organizer!');
  }

  missionData.creator = {
    creatorId: missionData.creatorId,
    name: creator.fullName,
    creatorRole: 'administrator',
  };

  const mission = await missionServices.createMission(missionData);

  if (!mission) {
    throw new CustomError.BadRequestError('Failed to create mission!');
  }

  // create new invitation
  await Promise.all(
    missionData.requestedOrganizers.map(async (organizer: string) => {
      const invitationPayload = {
        consumerId: organizer,
        type: 'mission',
        inviterId: missionData.creatorId,
        contentId: mission._id,
        status: 'invited',
      };

      await Invitation.create(invitationPayload);
    }),
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Mission creation successfull',
    data: mission,
  });
};

// controller for retrive missions by creatorId
const retriveMissionsByCreatorId = async (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const missions = await missionServices.getAllMissionsByCreator(creatorId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission retrive successfull',
    data: missions,
  });
};

// controller for retrive missions by creatorId
const retriveSpecificMissionsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const mission = await missionServices.getSpecificMissionsById(id);

  if (!mission) {
    throw new CustomError.NotFoundError('Mission not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission retrive successfull',
    data: mission,
  });
};

// controller for delete specific mission
const deleteSpecificOMission = async (req: Request, res: Response) => {
  const { id } = req.params;
  const mission = await missionServices.deleteMissionById(id);
  if (!mission.deletedCount) {
    throw new CustomError.BadRequestError('Failed to delete mission!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission delete successfull',
  });
};

// controller for search leader/organizer
const searchOrganization = async (req: Request, res: Response) => {
  const { query } = req.query;

  // Define the search condition
  const searchCondition: any = {};

  // If a query is provided and it's a string, add a text search condition
  if (query && typeof query === 'string') {
    searchCondition.$text = { $search: query };
  }

  // Find organizers based on the search condition
  const organizations = await Organization.find(searchCondition).select('name description');

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizations search successful',
    data: organizations,
  });
};

// controller for search leader/organizer
const searchOrganizer = async (req: Request, res: Response) => {
  const { query } = req.query; // Get the search query from the request

  // Define the search condition
  const searchCondition: any = { roles: 'organizer' };

  // If a query is provided and it's a string, add a text search condition
  if (query && typeof query === 'string') {
    searchCondition.$text = { $search: query };
  }

  // Find organizers based on the search condition
  const organizers = await User.find(searchCondition).select('image fullName profession');

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizer search successful',
    data: organizers,
  });
};

// retrive missions by organization
const retriveMissionsByOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const missions = await missionServices.getAllMissionsByOrganization(organizationId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status:'success',
    message: 'Mission retrive successfull',
    data: missions,
  });
}

export default {
  createMission,
  retriveMissionsByCreatorId,
  retriveSpecificMissionsById,
  deleteSpecificOMission,
  searchOrganization,
  searchOrganizer,
  retriveMissionsByOrganization,
};
