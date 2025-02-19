import mongoose from 'mongoose';
import IOrganization from './organization.interface';

const organizationSchema = new mongoose.Schema<IOrganization>(
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
    connectedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
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
  },
  {
    timestamps: true,
  },
);

organizationSchema.index({
  name: 'text',
  description: 'text',
});

const Organization = mongoose.model<IOrganization>('organization', organizationSchema);
export default Organization;
