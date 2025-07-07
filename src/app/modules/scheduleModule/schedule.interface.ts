import { Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  organizer: Types.ObjectId;
  name: string;
  globalTime: {
    startTime: string;
    endTime: string;
    isAllDay: boolean;
  };
  isGlobalTime: boolean;
  dates: {
    date: Date;
    dayName: string;
    innerTime: {
      startTime: string;
      endTime: string;
      isAllDay: boolean;
    };
    repeatOn: string[]; // no repeat, weekly on the day, monthly on the date
    endType: string; // never, on, cycle
    endOn: Date | null;
    endCycle: number | null;
  }[];
}
