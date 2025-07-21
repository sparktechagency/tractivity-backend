import { ISchedule } from './schedule.interface';
import Schedule from './schedule.model';

// service for create new schedule
const createSchedule = async (data: Partial<ISchedule>) => {
  return await Schedule.create(data);
};

const retrieveSchedulesByOrganizer = async (organizerId: string) => {
  return await Schedule.find({ organizer: organizerId });
};

const updateScheduleStatus = async (scheduleId: string, status: string) => {
  return await Schedule.findByIdAndUpdate(scheduleId, { isActive: status });
};

export default {
  createSchedule,
  retrieveSchedulesByOrganizer,
};
