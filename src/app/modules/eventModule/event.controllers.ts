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

  const creator = await userServices.getSpecificUser(eventData.creatorId);
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
      eventData.images = [eventDocumentPaths];
    }
  }

  eventData.creator = {
    creatorId: eventData.creatorId,
    name: creator.fullName,
    creatorRole: 'organizer',
    isActive: true,
  };

  eventData.cords = {
    lat: Number(eventData.latitude),
    lng: Number(eventData.longitude),
  };

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

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Event creation successfull',
    data: mission,
  });
};

// controller for search volunteers
const searchVolunteers = async (req: Request, res: Response) => {
  const { query } = req.query;

  const volunteers = await userServices.searchVolunteers(query as string);

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
  const {status} = req.query
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
  const updatedEvent = await eventServices.updateSpecificEventById(id, {status: 'deliveried'});

  if (!updatedEvent?.isModified) {
    throw new CustomError.BadRequestError('Failed to update event!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events deliveried successfull',
  });
};

export default {
  createNewEvent,
  searchVolunteers,
  retriveEventsByOrganizer,
  deleteSpecificEvent,
  updateSpecificEvent,
};
