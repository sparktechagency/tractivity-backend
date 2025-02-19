import mongoose from 'mongoose';
import IMission from './mission.interface';

const missionSchema = new mongoose.Schema<IMission>(
  {
    creator: {
      creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      name: String,
      creatorRole: String,
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    connectedOrganizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization',
      },
    ],
    requestedOrganizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    connectedOrganizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    requestedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      }
    ],
    connectedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      }
    ],
    mode: {
      type: String,
      enum: {
        values: ['public', 'private'],
        message: '{VALUE} is not accepted as a mode. Please use public/private.'
      },
      required: true,
    },
    report: {
      hours: {
        type: Number,
        default: 0,
      },
      mileage: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not accepted as a status. Please use active/inactive.'
      },
      default: 'active', 
    }
  },
  {
    timestamps: true,
  },
);

const Mission = mongoose.model<IMission>('mission', missionSchema);
export default Mission;
