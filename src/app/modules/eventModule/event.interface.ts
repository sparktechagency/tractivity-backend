import { Document, Types } from 'mongoose';

export interface IEvent extends Document {
  creator: {
    creatorId: Types.ObjectId;
    name: string;
    creatorRole: string;
    isActive: boolean;
  };
  missionId: Types.ObjectId;
  name: string;
  description: string;
  images: string[];
  documents: string[];
  address: {
    state: string;
    city: string;
    zip: string;
  };
  fullAddress: string;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  mode: string;
  status: string;
  report: {
    hours: number;
    mileage: number;
  };
  cords: {
    lat: number;
    lng: number;
  };
  invitedVolunteer: {
    volunteer: Types.ObjectId;
    workTitle: string;
    workStatus: string;
    startInfo: {
      isStart: boolean;
      startDate: Date;
    };
    totalWorkedHour: number;
    mileage: number;
  }[];
  joinedVolunteer: {
    volunteer: Types.ObjectId;
    workTitle: string;
    workStatus: string;
    startInfo: {
      isStart: boolean;
      startDate: Date;
    };
    totalWorkedHour: number;
    mileage: number;
  }[];
  isCustomDate: boolean;
  schedule: Types.ObjectId;
  eventDates: {
    date: Date;
    dayName: string;
    innerTime: {
      startTime: string;
      endTime: string;
      isAllDay: boolean;
    };
    repeatOn: string[];
    endType: string;
    endOn: Date;
    endCycle: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
