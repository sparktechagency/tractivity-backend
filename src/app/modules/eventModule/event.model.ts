import mongoose from 'mongoose';
import { IEvent } from './event.interface';

const eventSchema = new mongoose.Schema<IEvent>(
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
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'mission',
    },
    name: String,
    description: String,
    images: [String],
    documents: [String],
    address: {
      state: String,
      city: String,
      zip: String,
    },
    cords: {
      lat: Number,
      lng: Number,
    },
    startTime: String,
    endTime: String,
    startDate: Date,
    endDate: Date,
    mode: {
      type: String,
      enum: {
        values: ['public', 'private'],
        message: '{VALUE} is not accepted. Please use public/private',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['running', 'deliveried'],
        message: '{VALUE} is not accepted. Please use running or deliveried',
      },
      default: 'running',
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
    invitedVolunteer: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
        workTitle: {
          type: String,
          default: null,
        },
        workStatus: {
          type: String,
          enum: {
            values: ['complete', 'running', 'intialized'],
            message: '{VALUE} is not accepted. Please use intialized/running/complete',
          },
          default: 'intialized',
        },
        startInfo: {
          isStart: {
            type: Boolean,
            default: false,
          },
          startDate: Date,
        },
        totalWorkedHour: {
          type: Number,
          default: 0,
        },
        mileage: {
          type: Number,
          default: 0,
        },
      },
    ],
    joinedVolunteer: [
      {
        volunteer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
        workTitle: {
          type: String,
          default: null,
        },
        workStatus: {
          type: String,
          enum: {
            values: ['complete', 'running', 'intialized'],
            message: '{VALUE} is not accepted. Please use intialized/running/complete',
          },
          default: 'intialized',
        },
        startInfo: {
          isStart: {
            type: Boolean,
            default: false,
          },
          startDate: Date,
        },
        totalWorkedHour: {
          type: Number,
          default: 0,
        },
        mileage: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

eventSchema.index({
  name: 'text',
  description: 'text',
});

const Event = mongoose.model<IEvent>('event', eventSchema);
export default Event;
