import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import Invitation from './invitation.model';
import CustomError from '../../errors';
import { populate } from 'dotenv';
import eventServices from '../eventModule/event.services';
import invitationServices from './invitation.services';

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

  const updatedInvitation = await Invitation.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });

  if (!updatedInvitation) {
    throw new CustomError.BadRequestError('Failed to reject invitation!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invitation rejected successfull',
  });
};

// controller for retrive all invitations by volunteer
const retriveInvitationsByVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;

  const invitations: any = await Invitation.find({ consumerId: volunteerId }).populate({
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

  const event = await eventServices.retriveSpecificEventById(invitation.contentId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  // check volunteer exist in invitedVolunteer array in content
  const volunteerInInvitedVolunteerListInEvent = event?.invitedVolunteer.find(
    (volunteer: any) => volunteer.volunteer.toString() === volunteerId,
  );
  if (volunteerInInvitedVolunteerListInEvent) {
    console.log(volunteerInInvitedVolunteerListInEvent);
    event.joinedVolunteer.push(volunteerInInvitedVolunteerListInEvent);
    event.invitedVolunteer = event.invitedVolunteer.filter((reqV: any) => reqV.volunteer.toString() !== volunteerId);
  }
  await event.save();

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
  console.log(invitation._id.toString())
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

export default {
  getOrganizerInvitedMissions,
  rejectInvitation,
  retriveInvitationsByVolunteer,
  joinVolunteerToEvent,
  deleteEventInviation,
};
