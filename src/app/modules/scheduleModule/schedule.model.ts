import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organization',
  },
  name: {
    type: String,
    required: true,
  },
  globalTime: {
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
  isGlobalTime: {
    type: Boolean,
    default: false,
  },
  dates: [
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
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Schedule = mongoose.model('schedule', scheduleSchema);
export default Schedule;
