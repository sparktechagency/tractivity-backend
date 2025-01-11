import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    type: {
      type: String,
      enum: ['mission', 'event'],
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'type',
    },
    status: {
        type: String,
        enum: ['invited', 'accepted', 'rejected'],
        default: 'invited',
    }
  },
  {
    timestamps: true,
  },
);

const Invitation = mongoose.model('invitation', invitationSchema);
export default Invitation;
