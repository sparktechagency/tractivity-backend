import { Request, Response } from 'express';
import userServices from '../userModule/user.services';
import CustomError from '../../errors';
import missionServices from '../missionModule/mission.services';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';
import Invitation from '../invitationModule/invitation.model';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import eventServices from './event.services';
import dateChacker from '../../../utils/dateChacker';
import invitationServices from '../invitationModule/invitation.services';
import organizationService from '../organizationModule/organization.service';

// controller for create new event
const createNewEvent = async (req: Request, res: Response) => {
  const eventData = req.body;
  const files = req.files;

  const isDateInFuture = dateChacker.isFutureDate(eventData.date);

  if (!isDateInFuture) {
    throw new CustomError.BadRequestError('Event date cannot be in the past. Please select a valid future date!');
  }

  if (eventData.invitedVolunteer) {
    eventData.invitedVolunteer = JSON.parse(eventData.invitedVolunteer);
  }

  if (!eventData.invitedVolunteer || eventData.invitedVolunteer.length === 0) {
    throw new CustomError.BadRequestError('You must invite at least one volunteer to the event!');
  }

  const creator: any = await userServices.getSpecificUser(eventData.creatorId);
  if (!creator) {
    throw new CustomError.BadRequestError('No creator found by the creatorId!');
  }

  // check the creator has administrator permission
  if (!creator.roles.includes('organizer')) {
    throw new CustomError.BadRequestError('Creator does not have organizer permission!');
  }

  const mission = await missionServices.getSpecificMissionsById(eventData.missionId);
  if (!mission) {
    throw new CustomError.BadRequestError("Mission dosen't exist. You can't create event under the mission!");
  }

  // check the mission is active
  if (mission.status !== 'active') {
    throw new CustomError.BadRequestError('Mission is not active. You can not create event under the mission!');
  }

  // check the creator is member of mission.connectedOrganizers
  if (!mission.connectedOrganizers.find((org: any) => org._id.toString() === creator._id.toString())) {
    throw new CustomError.BadRequestError('Creator dose not have access to create event!');
  }

  if (files && files.images) {
    const eventImagePaths = await fileUploader(files as FileArray, `event-image`, 'images');
    if (Array.isArray(eventImagePaths)) {
      eventData.images = eventImagePaths;
    } else {
      eventData.images = [eventImagePaths];
    }
  }

  if (files && files.documents) {
    const eventDocumentPaths = await fileUploader(files as FileArray, `event-document`, 'documents');
    if (Array.isArray(eventDocumentPaths)) {
      eventData.documents = eventDocumentPaths;
    } else {
      eventData.documents = [eventDocumentPaths];
    }
  }

  eventData.creator = {
    creatorId: eventData.creatorId,
    name: creator.fullName,
    creatorRole: 'organizer',
    isActive: true,
  };

  // move organizer from requestedOrganizer to connectedOrganizer list
  // const organizerFromRequestedOrganizerList = mission.requestedOrganizers.find((reqO) => reqO.toString() === eventData.creatorId);
  // const organizerFromConnectedOrganizerList = mission.connectedOrganizers.find((conO) => conO.toString() === eventData.creatorId);
  // if (organizerFromRequestedOrganizerList || organizerFromConnectedOrganizerList) {
  //   mission.connectedOrganizers.push(organizerFromRequestedOrganizerList as string);
  //   mission.requestedOrganizers = mission.requestedOrganizers.filter((reqO) => reqO.toString() !== eventData.creatorId);
  //   await mission.save();
  // } else {
  //   throw new CustomError.BadRequestError('The organizer is not invited of mission to creating event!');
  // }

  const event = await eventServices.createEvent(eventData);

  //   // create new invitation
  await Promise.all(
    eventData.invitedVolunteer.map(async (vol: (typeof eventData.invitedVolunteer)[0]) => {
      const invitationPayload = {
        consumerId: vol.volunteer,
        type: 'event',
        inviterId: eventData.creatorId,
        contentId: event._id,
        status: 'invited',
      };

      await Invitation.create(invitationPayload);
    }),
  );

  // const invitation = await invitationServices.retriveInvitationByConsumerId(eventData.creatorId);
  // if (invitation) {
  //   invitation.status = 'accepted';
  //   await invitation.save();
  // }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Event creation successfull',
    data: event,
  });
};

// controller for search volunteers
const searchVolunteers = async (req: Request, res: Response) => {
  const { missionId } = req.params;
  // const { query } = req.query;

  const mission = await missionServices.getSpecificMissionsById(missionId);
  if (!mission) {
    throw new CustomError.BadRequestError('Invalid mission id!');
  }

  let volunteers: any = [];

  await Promise.all(
    mission.connectedOrganizations.map(async (org: any) => {
      const organization = await organizationService.getSpecificOrganizationById(org);
      if (organization) {
        volunteers = [...volunteers, ...organization.connectedVolunteers];
      }
    }),
  );

  // const filteredVolunteers = await userServices.searchVolunteers(query as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteers retrive successfull',
    data: volunteers,
  });
};

// controller for retrive all events by organizer/creator
const retriveEventsByOrganizer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.query;
  const events = await eventServices.retriveEventsByOrganizer(id, status as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events retrive successfull',
    data: events,
  });
};

// controller for delete specific event by id
const deleteSpecificEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedEvent = await eventServices.deleteSpecificEventById(id);

  if (!deletedEvent.deletedCount) {
    throw new CustomError.BadRequestError('Failed to delete event!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events delete successfull',
  });
};

// controller for update specific event status by id
const updateSpecificEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedEvent = await eventServices.updateSpecificEventById(id, { status: 'deliveried' });

  if (!updatedEvent?.isModified) {
    throw new CustomError.BadRequestError('Failed to update event!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events deliveried successfull',
  });
};

// controller for retrive specific invited volunteer in event
const retriveSpecificVolunteerInEvent = async (req: Request, res: Response) => {
  const { eventId, volunteerId } = req.body;
  const event = await eventServices.retriveSpecificEventById(eventId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  let volunteerInEvent = event.invitedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
  if (!volunteerInEvent) {
    volunteerInEvent = event.joinedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
  }

  if (!volunteerInEvent) {
    throw new CustomError.BadRequestError('No volunteer found in the event!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteer retrive successfull',
    data: volunteerInEvent,
  });
};

// controller for search events
const searchEvents = async (req: Request, res: Response) => {
  const { query } = req.query;
  const events = await eventServices.searchEvents(query as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Event retrive successfull',
    data: events,
  });
};

// controller for search events
const retriveEventsByVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;
  const { query, status, date } = req.query;
  const events = await eventServices.retriveEventsByVolunteer(volunteerId, query as string, status as string, date as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Event retrive successfull',
    data: events,
  });
};

// retrive all events by missionId
const retriveAllEventsByMissionId = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const events = await eventServices.retriveAllEventsByMissionId(id, limit, skip);

  const totalEvents = events.length || 0;
  const totalPages = Math.ceil(totalEvents / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events retrive successfull',
    meta: {
      totalData: totalEvents,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: events,
  });
};

// controller for retrive specific event by id
const retriveSpecificEventsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await eventServices.retriveSpecificEventById(id);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Event retrive successfull',
    data: event,
  });
};

// controller for volunteer start work
const volunteerStartWork = async (req: Request, res: Response) => {
  const { eventId, volunteerId } = req.body;
  const event = await eventServices.retriveSpecificEventById(eventId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  let volunteerInEvent = event.joinedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
  if (!volunteerInEvent) {
    throw new CustomError.BadRequestError('No volunteer found in the event!');
  }

  if (volunteerInEvent.workStatus !== 'intialized') {
    throw new CustomError.BadRequestError('Volunteer has already procceed the work!');
  }

  if (volunteerInEvent.startInfo.isStart) {
    throw new CustomError.BadRequestError('Volunteer has already started work!');
  }

  volunteerInEvent.startInfo.isStart = true;
  volunteerInEvent.startInfo.startDate = new Date();
  volunteerInEvent.workStatus = 'running';

  await event.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteer start work successfull',
    data: volunteerInEvent,
  });
};

// controller for volunteer end work
const volunteerEndWork = async (req: Request, res: Response) => {
  const { eventId, volunteerId } = req.body;
  const event = await eventServices.retriveSpecificEventById(eventId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  let volunteerInEvent = event.joinedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
  if (!volunteerInEvent) {
    throw new CustomError.BadRequestError('No volunteer found in the event!');
  }

  if (volunteerInEvent.workStatus !== 'running') {
    throw new CustomError.BadRequestError('Work has not currently running to end!');
  }

  if (!volunteerInEvent.startInfo.isStart) {
    throw new CustomError.BadRequestError('Volunteer has not started work yet!');
  }

  const endDate = new Date();
  volunteerInEvent.startInfo.isStart = false;
  volunteerInEvent.totalHours += (endDate.getTime() - volunteerInEvent.startInfo.startDate.getTime()) / 3600000;
  volunteerInEvent.workStatus = 'complete';

  await event.save();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteer end work successfull',
    data: volunteerInEvent,
  });
};

// controller for retrive all events
const retriveAllEvents = async (req: Request, res: Response) => {
  const { query, status } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const events = await eventServices.retriveAllEvents(query as string, status as string, skip, limit);

  const totalEvents = events.length || 0;
  const totalPages = Math.ceil(totalEvents / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events retrive successfull',
    meta: {
      totalData: totalEvents,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: events,
  });
};

export default {
  createNewEvent,
  searchVolunteers,
  retriveEventsByOrganizer,
  deleteSpecificEvent,
  updateSpecificEvent,
  retriveSpecificVolunteerInEvent,
  searchEvents,
  retriveAllEventsByMissionId,
  retriveSpecificEventsById,
  retriveEventsByVolunteer,
  volunteerStartWork,
  volunteerEndWork,
  retriveAllEvents,
};
