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
    fullAddress: String,
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
        values: ['running', 'deliveried', 'expired'],
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
    isCustomDate: {
      type: Boolean,
      default: false,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'schedule',
    },
    eventDates: [
      {
        date: Date,
        dayName: String,
        innerTime: {
          startTime: {
            type: String,
            trim: true,
            default: '00:00',
          },
          endTime: {
            type: String,
            trim: true,
            default: '00:00',
          },
          isAllDay: {
            type: Boolean,
            default: false,
          },
        },
        repeatOn: [
          {
            type: String,
            enum: ['no-repeat', 'weekly-on-day', 'monthly-on-date'],
            default: 'no-repeat',
          },
        ],
        endType: {
          type: String,
          enum: ['never', 'onDate', 'onCycle'],
          default: 'never',
        },
        endOn: {
          type: Date,
          default: null,
        },
        endCycle: {
          type: Number,
          default: null,
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
