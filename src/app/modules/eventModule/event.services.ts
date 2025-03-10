import { IEvent } from './event.interface';
import Event from './event.model';

// service for create mission
const createEvent = async (data: Partial<IEvent>) => {
  return await Event.create(data);
};

// service for retrive all events by organizer/creator
const retriveEventsByOrganizer = async (id: string, status: string) => {
  const query: any = { 'creator.creatorId': id };
  if (status) {
    query.status = status;
  }

  return await Event.find(query);
};

// service for retrive specific event by organizer/creator
const retriveSpecificEventById = async (id: string) => {
  return await Event.findOne({ _id: id }).populate([
    {
      path: 'missionId',
      select: 'name connectedOrganizer connectedOrganizations',
      populate: [
        {
          path: 'connectedOrganizations',
          select: 'name',
        },
        {
          path: 'connectedOrganizers',
          select: 'image fullName',
        },
      ],
    },
    {
      path: 'invitedVolunteer.volunteer',
      select: 'fullName image profession',
    },
    {
      path: 'joinedVolunteer.volunteer',
      select: 'fullName image profession',
    },
  ]);
};

// service for retrive specific event by organizer/creator without volunteer population
const retriveSpecificEventByIdWithoutVolunteerPopulation = async (id: string) => {
  return await Event.findOne({ _id: id }).populate({
    path: 'missionId',
    select: 'name connectedOrganizer connectedOrganizations',
    populate: [
      {
        path: 'connectedOrganizations',
        select: 'name',
      },
      {
        path: 'connectedOrganizers',
        select: 'image fullName',
      },
    ],
  });
};

// service for delete specific event by id
const deleteSpecificEventById = async (id: string) => {
  return await Event.deleteOne({ _id: id });
};

// service for update specific event by id
const updateSpecificEventById = async (id: string, data: Partial<IEvent>) => {
  return await Event.findOneAndUpdate({ _id: id }, data, { new: true });
};

// service for search events
const searchEvents = async (searchQuery: string) => {
  // Execute the query
  return await Event.find({ $text: { $search: searchQuery } }).populate({
    path: 'missionId',
    select: 'connectedOrganizations connectedOrganizers',
    populate: [
      {
        path: 'connectedOrganizations',
        select: 'name',
      },
      {
        path: 'connectedOrganizers',
        select: 'fullName image',
      },
    ],
  });
};

// service for search events
const retriveEventsByVolunteer = async (volunteerId: string, searchQuery: string, status: string, date: string) => {
  type Query = {
    joinedVolunteer?: { $elemMatch: { volunteer: string } };
    $text?: { $search: string };
    status?: string;
    date?: { $gte: Date; $lt: Date };
  };

  const query: Query = {};

  // Filter by volunteerId in the joinedVolunteer array
  if (volunteerId) {
    query.joinedVolunteer = { $elemMatch: { volunteer: volunteerId } };
  }

  // Add full-text search if searchQuery is provided
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Add status filter if provided
  if (status) {
    query.status = status;
  }

  // Add date filter if provided (specific day)
  if (date) {
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1); // Increment by 1 day

    query.date = {
      $gte: targetDate, // Start of the day
      $lt: nextDate, // Start of the next day
    };
  }

  // Execute the query
  return await Event.find(query).populate({
    path: 'missionId',
    select: 'connectedOrganizations connectedOrganizers',
    populate: [
      {
        path: 'connectedOrganizations',
        select: 'name',
      },
      {
        path: 'connectedOrganizers',
        select: 'fullName image',
      },
    ],
  });
};

// service for retrieve all events report by specific volunteer
const getAllEventsReportByVolunteer = async (volunteerId: string, startDate?: Date, endDate?: Date) => {
  const filter: any = { 'joinedVolunteer.volunteer': volunteerId };

  // Add date range filters if both fromDate and toDate are provided
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (startDate) {
    filter.createdAt = { $gte: startDate };
  } else if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  return await Event.find(filter).populate({
    path: 'missionId',
    select: 'connectedOrganizations connectedOrganizers',
    populate: [
      {
        path: 'connectedOrganizations',
        select: 'name',
      },
      {
        path: 'connectedOrganizers',
        select: 'fullName image',
      },
    ],
  });
};

// service retrive all events by missionId
const retriveAllEventsByMissionId = async (id: string, limit: number, skip: number) => {
  return await Event.find({ missionId: id })
    .skip(skip)
    .limit(limit)
    .select('-invitedVolunteer -joinedVolunteer._id -joinedVolunteer.workStatus -joinedVolunteer.startInfo')
    .populate([
      {
        path: 'missionId',
        select: 'name',
        populate: [
          {
            path: 'connectedOrganizations',
            select: 'name',
          },
        ],
      },
      {
        path: 'joinedVolunteer.volunteer',
        select: 'fullName image',
      },
    ]);
};

// service for retrive all events
const retriveAllEvents = async (searchQuery: string, status: string, skip: number, limit: number) => {
  const query: any = {};
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  if (status) {
    query.status = status;
  }
  return await Event.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: 'joinedVolunteer.volunteer',
        select: 'fullName image',
      },
      {
        path: 'creator.creatorId',
        select: 'image',
      },
      {
        path: 'missionId',
        select: 'connectedOrganizations',
        populate: {
          path: 'connectedOrganizations',
          select: 'name',
        },
      },
    ]);
};

// service for delete specific events
const deleteSpecificEvent = async (id: string) => {
  return await Event.deleteOne({ _id: id });
};

// service for retrieve all events report by mission
const getAllEventsReportByMission = async (missionId: string, startDate?: Date, endDate?: Date) => {
  const filter: any = { missionId };

  // Add date range filters if both fromDate and toDate are provided
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (startDate) {
    filter.createdAt = { $gte: startDate };
  } else if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  return await Event.find(filter)
    .select('-invitedVolunteer -joinedVolunteer._id -joinedVolunteer.workStatus -joinedVolunteer.startInfo')
    .populate([
      {
        path: 'missionId',
        select: 'name',
        populate: [
          {
            path: 'connectedOrganizations',
            select: 'name',
          },
        ],
      },
      {
        path: 'joinedVolunteer.volunteer',
        select: 'fullName image',
      },
    ]);
};

export default {
  createEvent,
  retriveEventsByOrganizer,
  retriveSpecificEventById,
  retriveSpecificEventByIdWithoutVolunteerPopulation,
  deleteSpecificEventById,
  updateSpecificEventById,
  searchEvents,
  retriveAllEventsByMissionId,
  retriveEventsByVolunteer,
  retriveAllEvents,
  deleteSpecificEvent,
  getAllEventsReportByMission,
  getAllEventsReportByVolunteer,
};
