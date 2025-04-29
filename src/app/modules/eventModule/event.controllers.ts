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
import { calculateDistance } from '../../../utils/calculateDistance';
import User from '../userModule/user.model';
import { Types } from 'mongoose';
import SocketManager from '../../socket/manager.socket';
import { addUserToRoom } from '../roomMembershipModule/roomMembership.utils';

// controller for create new event
const createNewEvent = async (req: Request, res: Response) => {
  const eventData = req.body;
  const files = req.files;

  // Step 1: Date Validation Rules
  const { startDate, endDate } = eventData;

  if (!startDate && !endDate) {
    throw new CustomError.BadRequestError('You must provide at least startDate or both startDate and endDate!');
  }

  if (!startDate && endDate) {
    throw new CustomError.BadRequestError('You cannot provide endDate without startDate!');
  }

  if (startDate) {
    const start = new Date(startDate);
    eventData.startDate = start;

    if (!dateChacker.isFutureDate(start)) {
      throw new CustomError.BadRequestError('Start date must be in the future!');
    }

    if (endDate) {
      const end = new Date(endDate);
      eventData.endDate = end;

      if (end < start) {
        throw new CustomError.BadRequestError('End date cannot be earlier than start date!');
      }
    }
  }

  // Step 2: Parse invitedVolunteer JSON
  if (eventData.invitedVolunteer) {
    eventData.invitedVolunteer = JSON.parse(eventData.invitedVolunteer);
  }

  if (!eventData.invitedVolunteer || eventData.invitedVolunteer.length === 0) {
    throw new CustomError.BadRequestError('You must invite at least one volunteer to the event!');
  }

  // Step 3: Validate creator
  const creator: any = await userServices.getSpecificUser(eventData.creatorId);
  if (!creator) {
    throw new CustomError.BadRequestError('No creator found by the creatorId!');
  }

  if (!creator.roles.includes('organizer')) {
    throw new CustomError.BadRequestError('Creator does not have organizer permission!');
  }

  // Step 4: Validate mission
  const mission = await missionServices.getSpecificMissionsById(eventData.missionId);
  if (!mission) {
    throw new CustomError.BadRequestError("Mission doesn't exist. You can't create event under the mission!");
  }

  if (mission.status !== 'active') {
    throw new CustomError.BadRequestError('Mission is not active. You cannot create an event under this mission!');
  }

  const isCreatorInOrganizers = mission.connectedOrganizers.find((org: any) => org._id.toString() === creator._id.toString());

  if (!isCreatorInOrganizers) {
    throw new CustomError.BadRequestError('Creator does not have access to create event!');
  }

  // Step 5: File uploads
  if (files && files.images) {
    const eventImagePaths = await fileUploader(files as FileArray, 'event-image', 'images');
    eventData.images = Array.isArray(eventImagePaths) ? eventImagePaths : [eventImagePaths];
  }

  if (files && files.documents) {
    const eventDocumentPaths = await fileUploader(files as FileArray, 'event-document', 'documents');
    eventData.documents = Array.isArray(eventDocumentPaths) ? eventDocumentPaths : [eventDocumentPaths];
  }

  // Step 6: Set event metadata
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

  eventData.address = {
    state: eventData.state,
    city: eventData.city,
    zip: eventData.zip,
  };

  // Step 7: Create Event
  const event = await eventServices.createEvent(eventData);

  // Step 8: Join creator to socket/chat room
  const socketManager = SocketManager.getInstance();
  const eventId = event._id!.toString();
  await addUserToRoom(eventData.creatorId, eventId);
  socketManager.joinUserToARoom(eventId, eventData.creatorId);

  // Step 9: Send Invitations
  await Promise.all(
    eventData.invitedVolunteer.map(async (vol: (typeof eventData.invitedVolunteer)[0]) => {
      const invitationPayload = {
        consumerId: vol.volunteer,
        type: 'event',
        inviterId: eventData.creatorId,
        contentId: event._id,
        status: 'invited',
        createdFor: 'volunteer',
      };
      await Invitation.create(invitationPayload);
    }),
  );

  // Step 10: Final Response
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Event creation successful',
    data: event,
  });
};

// controller for search volunteers
const searchVolunteers = async (req: Request, res: Response) => {
  const { missionId } = req.params;

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

  // Remove mission's connectedVolunteers from the volunteers array
  const connectedVolunteersSet = new Set(mission.connectedVolunteers.map((v: any) => v.toString()));
  volunteers = volunteers.filter((volunteer: any) => !connectedVolunteersSet.has(volunteer.toString()));

  // console.log(volunteers);

  let volunteersWithDetails: any = [];
  if (volunteers.length > 0) {
    await Promise.all(
      volunteers.map(async (vol: any) => {
        const volunteer = await userServices.getSpecificUser(vol);
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

  // console.log(volunteersWithDetails)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteers retrieved successfully',
    data: volunteersWithDetails || [],
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

// retrieve all events report by specific volunteer
const retriveAllEventsReportByVolunteer = async (req: Request, res: Response) => {
  const { volunteerId } = req.params;
  const { fromDate, toDate } = req.query;

  console.log(volunteerId, fromDate, toDate);

  // Convert fromDate and toDate to JavaScript Date objects
  const startDate = fromDate ? new Date(fromDate as string) : undefined;
  const endDate = toDate ? new Date(toDate as string) : undefined;

  const events = await eventServices.getAllEventsReportByVolunteer(volunteerId, startDate, endDate);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events report retrieved successfully',
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

// controller for retrieve all events report by mission
const retriveAllEventsReportByMission = async (req: Request, res: Response) => {
  const { missionId } = req.params;
  const { fromDate, toDate } = req.query;

  // console.log(missionId, fromDate, toDate);

  // Convert fromDate and toDate to JavaScript Date objects
  const startDate = fromDate ? new Date(fromDate as string) : undefined;
  const endDate = toDate ? new Date(toDate as string) : undefined;

  const events = await eventServices.getAllEventsReportByMission(missionId, startDate, endDate);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Events report retrieved successfully',
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
  const event = await eventServices.retriveSpecificEventByIdWithoutVolunteerPopulation(eventId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  let volunteerInEvent = event.joinedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
  if (!volunteerInEvent) {
    throw new CustomError.BadRequestError('No volunteer found in the event!');
  }

  if (volunteerInEvent.startInfo.isStart) {
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
// const volunteerEndWork = async (req: Request, res: Response) => {
//   const { eventId, volunteerId } = req.body;
//   const event = await eventServices.retriveSpecificEventById(eventId);
//   if (!event) {
//     throw new CustomError.BadRequestError('Event not found!');
//   }

//   let volunteerInEvent = event.joinedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
//   if (!volunteerInEvent) {
//     throw new CustomError.BadRequestError('No volunteer found in the event!');
//   }

//   if (volunteerInEvent.workStatus !== 'running') {
//     throw new CustomError.BadRequestError('Work has not currently running to end!');
//   }

//   if (!volunteerInEvent.startInfo.isStart) {
//     throw new CustomError.BadRequestError('Volunteer has not started work yet!');
//   }

//   // calculate hours and mileage for the volunteer and calculate for event and update mission and update organization for hours and mileage

//   const endDate = new Date();
//   const volunteerHours = (endDate.getTime() - volunteerInEvent.startInfo.startDate.getTime()) / 3600000;
//   const volunteerMileage = volunteerInEvent.mileage + (volunteerInEvent.mileage * volunteerHours);

//   volunteerInEvent.startInfo.isStart = false;
//   volunteerInEvent.totalHours += (endDate.getTime() - volunteerInEvent.startInfo.startDate.getTime()) / 3600000;
//   volunteerInEvent.workStatus = 'complete';

//   await event.save();

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     status: 'success',
//     message: 'Volunteer end work successfull',
//     data: volunteerInEvent,
//   });
// };
const volunteerEndWork = async (req: Request, res: Response) => {
  const { eventId, volunteerId } = req.body;
  const event = await eventServices.retriveSpecificEventByIdWithoutVolunteerPopulation(eventId);
  if (!event) {
    throw new CustomError.BadRequestError('Event not found!');
  }

  const mission = await missionServices.getSpecificMissionsById(event.missionId as unknown as string);
  if (!mission) {
    throw new CustomError.BadRequestError('Event mission not found!');
  }

  let volunteerInEvent = event.joinedVolunteer.find((v: any) => v.volunteer.toString() === volunteerId);
  if (!volunteerInEvent) {
    throw new CustomError.BadRequestError('No volunteer found in the event!');
  }

  if (volunteerInEvent.workStatus !== 'running') {
    throw new CustomError.BadRequestError('Work is not currently running!');
  }

  if (!volunteerInEvent.startInfo.isStart) {
    throw new CustomError.BadRequestError('Volunteer has not started work yet!');
  }

  // Get volunteer's home coordinates
  const volunteer = await User.findById(volunteerId);
  if (!volunteer || !volunteer.cords || !volunteer.cords.lat || !volunteer.cords.lng) {
    throw new CustomError.BadRequestError('Volunteer location not found!');
  }

  // Get event coordinates
  if (!event.cords || !event.cords.lat || !event.cords.lng) {
    throw new CustomError.BadRequestError('Event location not found!');
  }

  // Calculate total worked hours
  const endDate = new Date();
  const volunteerHours = (endDate.getTime() - volunteerInEvent.startInfo.startDate.getTime()) / 3600000;

  // Calculate mileage
  const distance = calculateDistance(volunteer.cords.lat, volunteer.cords.lng, event.cords.lat, event.cords.lng);

  volunteerInEvent.startInfo.isStart = false;
  volunteerInEvent.totalWorkedHour += volunteerHours;
  volunteerInEvent.mileage += distance * 2; // Round trip
  volunteerInEvent.workStatus = 'complete';

  // add this volunteer hours and mileage to event
  event.report.hours += volunteerHours;
  event.report.mileage += distance * 2; // Round trip

  await event.save();

  // update mission report
  mission.report.hours += volunteerHours;
  mission.report.mileage += distance * 2; // Round trip

  await mission.save();

  await Promise.all(
    mission.connectedOrganizations.map(async (org: any) => {
      const organization = await organizationService.getSpecificOrganizationById(org);
      if (organization) {
        organization.report.hours += volunteerHours;
        organization.report.mileage += distance * 2; // Round trip
        await organization.save();
      }
    }),
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteer work ended successfully',
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
  retriveAllEventsReportByMission,
  retriveAllEventsReportByVolunteer,
};
