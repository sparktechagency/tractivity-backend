import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Invitation from './invitation.model';
import CustomError from '../../errors';
import { populate } from 'dotenv';
import eventServices from '../eventModule/event.services';
import invitationServices from './invitation.services';
import SocketManager from '../../socket/manager.socket';
import { addUserToRoom } from '../roomMembershipModule/roomMembership.utils';
import missionServices from '../missionModule/mission.services';

// controller for retrive all invited missions of organizer
const getOrganizerInvitedMissions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const organizerInvitedMissions = await Invitation.find({ consumerId: id, status: 'invited' })
    .populate({
      path: 'contentId',
      select: 'name description creator.creatorRole createdAt',
    })
    .populate({
      path: 'inviterId',
      select: 'fullName image',
    });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizer invited missions retrive successfull',
    data: organizerInvitedMissions,
  });
};

// controller for reject specific invitation
const rejectInvitation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const invitation = await invitationServices.retriveInvitationById(id);
  // console.log(invitation);

  if (!invitation) {
    throw new CustomError.BadRequestError('Invitation not found!');
  }

  // const mission = await missionServices.getSpecificMissionWithoutPopulating(inviations?.contentId as unknown as string)

  const updatedInvitation = await Invitation.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });

  if (!updatedInvitation) {
    throw new CustomError.BadRequestError('Failed to reject invitation!');
  }

  invitation.status = 'rejected';
  await invitation.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invitation rejected successfull',
  });
};

// controller for accept specific mission invitation
const acceptInvitation = async (req: Request, res: Response) => {
  const { invitationId } = req.params;

  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new CustomError.BadRequestError('Invitation not found');
  }

  if (invitation.status !== 'invited') {
    throw new CustomError.BadRequestError('Invitation is not invited');
  }

  const mission = await missionServices.getSpecificMissionsById(invitation.contentId as unknown as string);
  if (!mission) {
    throw new CustomError.BadRequestError('Mission not found');
  }

  const updatedInvitation = await Invitation.findByIdAndUpdate(invitationId, { status: 'accepted' }, { new: true });

  if (updatedInvitation?.isModified) {
    // move consumer from requestedOrganizers to connectedOrganizers
    mission.requestedOrganizers = mission.requestedOrganizers.filter((org: any) => org._id.toString() !== invitation.consumerId.toString());
    mission.connectedOrganizers.push(invitation.consumerId as unknown as string);
    await mission.save();
  } else {
    throw new CustomError.BadRequestError('Failed to accept invitation!');
  }

  invitation.status = 'accepted';
  await invitation.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invitation accepted successfull',
  });
};

// controller for retrive all invitations by volunteer
const retriveInvitationsByVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;
  const { type } = req.query;
  let invitations: any = [];

  if (type === 'event') {
    invitations = await Invitation.find({ consumerId: volunteerId, type: 'event', status: 'invited' }).populate({
      path: 'contentId',
      populate: {
        path: 'missionId',
        select: 'name connectedOrganizers connectedOrganizations',
        populate: [
          {
            path: 'connectedOrganizations',
            select: 'name creator.creatorRole',
          },
          {
            path: 'connectedOrganizers',
            select: 'fullName image',
          },
        ],
      },
      select: '-invitedVolunteer -joinedVolunteer',
    });
  } else if (type === 'mission') {
    invitations = await Invitation.find({ consumerId: volunteerId, type: 'mission', status: 'invited' }).populate({
      path: 'contentId',
    });
  } else {
    throw new CustomError.BadRequestError('Invalid type in query');
  }

  // Send the processed invitations
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invitations retrieved successfully',
    data: invitations,
  });
};

// controller for join volunteer into event or accept event joining invitation
const joinVolunteerToEvent = async (req: Request, res: Response) => {
  const { volunteerId, invitationId } = req.body;
  const socketManager = SocketManager.getInstance();

  const invitation: any = await Invitation.findOne({ _id: invitationId }).populate({
    path: 'contentId',
    populate: {
      path: 'missionId',
      select: 'name connectedOrganizers',
    },
  });
  if (!invitation) {
    throw new CustomError.BadRequestError('Invitation not found!');
  }

  const event = await eventServices.retriveSpecificEventByIdWithoutVolunteerPopulation(invitation.contentId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  // console.log(invitationId, volunteerId, event)

  // check volunteer exist in invitedVolunteer array in content
  const volunteerInInvitedVolunteerListInEvent = event?.invitedVolunteer.find(
    (volunteer: any) => volunteer.volunteer.toString() === volunteerId,
  );
  // console.log('invited array', volunteerInInvitedVolunteerListInEvent)
  if (volunteerInInvitedVolunteerListInEvent) {
    // console.log(volunteerInInvitedVolunteerListInEvent)
    volunteerInInvitedVolunteerListInEvent.workStatus = 'running';
    // console.log(volunteerInInvitedVolunteerListInEvent);
    event.joinedVolunteer.push(volunteerInInvitedVolunteerListInEvent);
    event.invitedVolunteer = event.invitedVolunteer.filter((reqV: any) => reqV.volunteer.toString() !== volunteerId);
  }
  await event.save();

  const volunteerInJoinedVolunteerListInEvent = event?.joinedVolunteer.find(
    (volunteer: any) => volunteer.volunteer.toString() === volunteerId,
  );
  // console.log('joined array', volunteerInJoinedVolunteerListInEvent)
  if (volunteerInJoinedVolunteerListInEvent) {
    const eventId = (event._id as string).toString();
    // Add user to Redis room membership
    await addUserToRoom(volunteerId, eventId);

    // Join user to the room in Socket.IO
    socketManager.joinUserToARoom(eventId, volunteerId);
  }

  invitation.status = 'accepted';
  await invitation.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteer joined successfull',
  });
};

// controller for delete event inviation.
const deleteEventInviation = async (req: Request, res: Response) => {
  const { invitationId } = req.params;

  const invitation = await invitationServices.retriveInvitationById(invitationId);
  if (!invitation) {
    throw new CustomError.BadRequestError('Invitation not found!');
  }

  const updatedInvitation = await Invitation.findByIdAndUpdate(invitationId, { status: 'rejected' }, { new: true });

  if (!updatedInvitation) {
    throw new CustomError.BadRequestError('Failed to reject invitation!');
  }

  const event = await eventServices.retriveSpecificEventById(invitation.contentId as unknown as string);
  console.log(invitation._id.toString());
  if (event) {
    event.invitedVolunteer = event.invitedVolunteer.filter((vol: any) => vol.volunteer.toString() !== invitation.consumerId.toString());
    await event.save();
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Event Invitation rejected successfull',
  });
};

// controller for accept mission inviation.
const acceptMissionInviationForVolunteer = async (req: Request, res: Response) => {
  const { invitationId } = req.params;

  const invitation = await invitationServices.retriveInvitationById(invitationId);
  if (!invitation) {
    throw new CustomError.BadRequestError('Invitation not found!');
  }

  if (invitation.status !== 'invited') {
    throw new CustomError.BadRequestError('Invitation is not invited');
  }

  const mission = await missionServices.getSpecificMissionsById(invitation.contentId as unknown as string);
  if (!mission) {
    throw new CustomError.BadRequestError('Mission not found');
  }

  const updatedInvitation = await Invitation.findByIdAndUpdate(invitationId, { status: 'accepted' }, { new: true });
  if (updatedInvitation?.isModified) {
    // move consumer from requestedVolunteers to connectedVolunteers
    mission.requestedVolunteers = mission.requestedVolunteers.filter((vol: any) => vol._id.toString() !== invitation.consumerId.toString());
    mission.connectedVolunteers.push(invitation.consumerId as unknown as string);
    await mission.save();
  } else {
    throw new CustomError.BadRequestError('Invitation is not invited');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Mission Invitation accepted successfull',
  });
};

export default {
  getOrganizerInvitedMissions,
  rejectInvitation,
  acceptInvitation,
  retriveInvitationsByVolunteer,
  joinVolunteerToEvent,
  deleteEventInviation,
  acceptMissionInviationForVolunteer,
};
