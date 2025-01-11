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
  cords: {
    lat: number;
    lng: number;
  };
  startTime: string;
  endTime: string;
  date: Date;
  mode: string;
  status: string;
  invitedVolunteer: {
    volunteer: Types.ObjectId;
    workTitle: string;
    workStatus: string;
    startInfo: {
      isStart: boolean;
      startDate: Date;
    };
    totalHours: number;
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
  }[];
}
