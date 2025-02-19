import mongoose, { Document, Types } from 'mongoose';

interface IMission extends Document {
  creator: {
    creatorId: Types.ObjectId;
    name: string;
    creatorRole: string;
    isActive: boolean;
  };
  name: string;
  description: string;
  // requestedOrganization: string[];
  connectedOrganizations: string[];
  requestedOrganizers: string[];
  connectedOrganizers: string[];
  requestedVolunteers: string[];
  connectedVolunteers: string[];
  mode: string;
  report: {
    hours: number;
    mileage: number;
  };
  status: string;
}

export default IMission;
