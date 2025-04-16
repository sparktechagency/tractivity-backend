import { Request, Response } from 'express';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import userServices from '../userModule/user.services';
import missionServices from './mission.services';
import Invitation from '../invitationModule/invitation.model';
import User from '../userModule/user.model';
import Organization from '../organizationModule/organization.model';
import organizationService from '../organizationModule/organization.service';

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
        createdFor: 'organizer',
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

// controller for update specific mission
const updateSpecificMission = async (req: Request, res: Response) => {
  const { id } = req.params;
  const missionData = req.body;

  const mission = await missionServices.getSpecificMissionsById(id);
  if (!mission) {
    throw new CustomError.NotFoundError('Mission not found!');
  }

  // check the creator has administrator permission
  if (!mission.creator.creatorRole.includes('administrator')) {
    throw new CustomError.BadRequestError('Creator does not have administrator permission!');
  }

  if (missionData.removedOrganizers) {
    if (Array.isArray(missionData.removedOrganizers)) {
      // remove the removed organizers from connectedOrganizers
      mission.connectedOrganizers = mission.connectedOrganizers.filter(
        (org: any) => !missionData.removedOrganizers.includes(org._id.toString()),
      );
    } else {
      throw new CustomError.BadRequestError('Removed organizers must be an array!');
    }
  }

  // add missionData.newOrganizers to requestedOrganizers
  if (missionData.newOrganizers) {
    if (Array.isArray(missionData.newOrganizers)) {
      mission.requestedOrganizers.push(...missionData.newOrganizers);
    } else {
      throw new CustomError.BadRequestError('New organizers must be an array!');
    }
  }

  await mission.save();

  // create mission invitation for all new organizers
  if (missionData.newOrganizers) {
    await Promise.all(
      missionData.newOrganizers.map(async (organizer: string) => {
        const invitationPayload = {
          consumerId: organizer,
          type: 'mission',
          inviterId: mission.creator.creatorId,
          contentId: mission._id,
          status: 'invited',
          createdFor: 'volunteer',
        };

        await Invitation.create(invitationPayload);
      }),
    );
  }

  const updatedMission = await missionServices.updateSpecificMission(id, missionData);

  if (!updatedMission?.isModified) {
    throw new CustomError.BadRequestError('Failed to update mission!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission update successfull',
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
  const { query } = req.query;
  const { organizations } = req.body;

  if (!organizations || organizations.length <= 0) {
    throw new CustomError.BadRequestError('Organizations must have at least one');
  }

  const organizers: any[] = [];
  const addedOrganizerIds = new Set<string>(); // to track unique organizers

  await Promise.all(
    organizations.map(async (org: any) => {
      const organization = await organizationService.getSpecificOrganizationById(org);

      if (organization && organization.connectedVolunteers.length > 0) {
        const volunteerPromises = organization.connectedVolunteers.map(async (vol: any) => {
          const user:any = await userServices.getSpecificUser(vol);
          if (
            user &&
            user.roles.includes('organizer') &&
            !addedOrganizerIds.has(user._id.toString()) // check uniqueness
          ) {
            organizers.push({
              _id: user._id,
              image: user.image,
              fullName: user.fullName,
              profession: user.profession,
            });
            addedOrganizerIds.add(user._id.toString());
          }
        });

        await Promise.all(volunteerPromises);
      }
    })
  );

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
    status: 'success',
    message: 'Mission retrive successfull',
    data: missions,
  });
};

// controller for retrive all missions report by organization
const retriveAllMissionsReportByOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const { fromDate, toDate } = req.query;

  // Convert fromDate and toDate to JavaScript Date objects
  const startDate = fromDate ? new Date(fromDate as string) : undefined;
  const endDate = toDate ? new Date(toDate as string) : undefined;

  const missions = await missionServices.getAllMissionsReportByOrganization(organizationId, startDate, endDate);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission retrieve successful',
    data: missions,
  });
};

// controller for retrive all missions of organizer
const getAllMissionsOfOrganizer = async (req: Request, res: Response) => {
  const { organizerId } = req.params;
  const { status } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!status) {
    throw new CustomError.BadRequestError('Status is required to make the request!');
  }

  const skip = (page - 1) * limit;
  const missions = await missionServices.getAllMissionsByOrganizerAndStatus(organizerId, status as string, skip, limit);

  const totalMissions = missions.length || 0;
  const totalPages = Math.ceil(totalMissions / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission retrive successfull',
    meta: {
      totalData: totalMissions,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: missions,
  });
};

// controller for invite volunteers to mission
const inviteVolunteersToMission = async (req: Request, res: Response) => {
  const { missionId } = req.params;
  const { volunteers } = req.body;

  if (!Array.isArray(volunteers)) {
    throw new CustomError.BadRequestError('Volunteers must be an array!');
  }

  const mission = await missionServices.getSpecificMissionsById(missionId);
  if (!mission) {
    throw new CustomError.NotFoundError('Invalid mission id!');
  }

  // first check the volunteer is already invited to the mission. only unique volunteers should be invited
  await Promise.all(
    volunteers.map(async (volunteer: string) => {
      if (mission.requestedVolunteers.length > 0 && mission.requestedVolunteers.find((v: any) => v.toString() !== volunteer)) {
        // create invitation for volunteer
        const invitationPayload = {
          consumerId: volunteer,
          type: 'mission',
          inviterId: mission.creator.creatorId,
          contentId: mission._id,
          status: 'invited',
          createdFor: 'volunteer',
        };

        await Invitation.create(invitationPayload);

        mission.requestedVolunteers.push(...volunteers);
        console.log(mission);
      }
      mission.requestedVolunteers.push(...volunteers);
      await mission.save();
    }),
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteers invited successfull!',
  });
};

// controller for retrieve volunteers for sending invitation
const retrieveVolunteersForInvitation = async (req: Request, res: Response) => {
  const { missionId } = req.params;

  const mission = await missionServices.getSpecificMissionsById(missionId);
  if (!mission) {
    throw new CustomError.NotFoundError('Invalid mission id!');
  }

  let volunteers: any[] = [];

  // Collect unique volunteers from connected organizations
  mission.connectedOrganizations.forEach((organization: any) => {
    organization.connectedVolunteers.forEach((volunteer: any) => {
      if (!volunteers.some((v: any) => v._id.toString() === volunteer._id.toString())) {
        volunteers.push(volunteer);
      }
    });
  });

  // Check for only unique volunteers who are not part of requestedVolunteers and connectedVolunteers
  const uniqueVolunteers = volunteers.filter(
    (volunteer: any) =>
      !mission.requestedVolunteers.some((v: any) => v._id.toString() === volunteer._id.toString()) &&
      !mission.connectedVolunteers.some((v: any) => v._id.toString() === volunteer._id.toString()),
  );

  let volunteersWithDetails: any = [];
  if (uniqueVolunteers.length > 0) {
    await Promise.all(
      uniqueVolunteers.map(async (vol: any) => {
        const volunteer = await userServices.getSpecificUser(vol._id); // Assuming _id is the unique identifier
        if (volunteer) {
          const payload = {
            fullName: volunteer.fullName,
            profession: volunteer.profession,
            image: volunteer.image,
            _id: volunteer._id,
          };
          volunteersWithDetails.push(payload);
        }
      }),
    );
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteers retrieved successfully!',
    data: volunteersWithDetails,
  });
};

// controller for remove organizer from mission connectedOrganizations array or requestedOrganizers array
const removeOrganizerFromMission = async (req: Request, res: Response) => {
  const { missionId } = req.params;
  const { organizerId } = req.body;

  const mission = await missionServices.getSpecificMissionsById(missionId);
  if (!mission) {
    throw new CustomError.NotFoundError('Invalid mission id!');
  }

  if (mission.connectedOrganizers.find((org: any) => org._id.toString() === organizerId)) {
    mission.connectedOrganizers = mission.connectedOrganizers.filter((org: any) => org._id.toString() !== organizerId);
  }

  if (mission.requestedOrganizers.find((org: any) => org._id.toString() === organizerId)) {
    mission.requestedOrganizers = mission.requestedOrganizers.filter((org: any) => org._id.toString() !== organizerId);
  }

  await mission.save();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizer removed successfull!',
  });
};

export default {
  createMission,
  retriveMissionsByCreatorId,
  retriveSpecificMissionsById,
  deleteSpecificOMission,
  updateSpecificMission,
  searchOrganization,
  searchOrganizer,
  retriveMissionsByOrganization,
  getAllMissionsOfOrganizer,
  inviteVolunteersToMission,
  retrieveVolunteersForInvitation,
  removeOrganizerFromMission,
  retriveAllMissionsReportByOrganization,
};
