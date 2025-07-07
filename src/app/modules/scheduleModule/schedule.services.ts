import { ISchedule } from './schedule.interface';
import Schedule from './schedule.model';

// service for create new schedule
const createSchedule = async (data: Partial<ISchedule>) => {
  return await Schedule.create(data);
};

const retrieveScheduleByOrganizer = async (organizerId: string) => {
  return await Schedule.find({ organizer: organizerId });
};

export default {
  createSchedule,
  retrieveScheduleByOrganizer,
};
