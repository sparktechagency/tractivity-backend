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

// service for delete specific event by id
const deleteSpecificEventById = async (id: string) => {
  return await Event.deleteOne({ _id: id });
};

// service for update specific event by id
const updateSpecificEventById = async (id: string, data: Partial<IEvent>) => {
  return await Event.findOneAndUpdate({ _id: id }, data, { new: true });
};

export default {
  createEvent,
  retriveEventsByOrganizer,
  deleteSpecificEventById,
  updateSpecificEventById,
};
