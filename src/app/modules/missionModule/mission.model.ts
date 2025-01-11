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
    connectedOrganizations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organization',
    }],
    requestedOrganizers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
    connectedOrganizers: [],
  },
  {
    timestamps: true,
  },
);

const Mission = mongoose.model<IMission>('mission', missionSchema);
export default Mission;
