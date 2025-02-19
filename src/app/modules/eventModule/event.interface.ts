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
    street: string;
    city: string;
    country: string;
  };
  startTime: string;
  endTime: string;
  date: Date;
  mode: string;
  status: string;
  report: {
    hours: number;
    mileage: number;
  };
  invitedVolunteer: {
    volunteer: Types.ObjectId;
    workTitle: string;
    workStatus: string;
    startInfo: {
      isStart: boolean;
      startDate: Date;
    };
    totalHours: number;
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
    totalHours: number;
    mileage: number;
  }[];
}
