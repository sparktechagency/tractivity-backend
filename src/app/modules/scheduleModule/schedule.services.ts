import { Types } from 'mongoose';
import { ISchedule } from './schedule.interface';
import Schedule from './schedule.model';

// service for create new schedule
const createSchedule = async (data: Partial<ISchedule>) => {
  return await Schedule.create(data);
};

const retrieveSchedulesByOrganizer = async (organizerId: string) => {
  return await Schedule.find({ organizer: organizerId });
};

const updateSpecificSchedule = async (scheduleId: string, data: Partial<ISchedule>) => {
  return await Schedule.findByIdAndUpdate(scheduleId, data);
};

const retrieveSpecificSchedule = async (scheduleId: Types.ObjectId) => {
  return await Schedule.findById(scheduleId);
};

export default {
  createSchedule,
  retrieveSchedulesByOrganizer,
  updateSpecificSchedule,
  retrieveSpecificSchedule,
};
