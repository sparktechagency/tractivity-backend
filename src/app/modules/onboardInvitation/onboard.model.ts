import mongoose from 'mongoose';
import { IOnboardInterface } from './onboard.interface';

const onboardSchema = new mongoose.Schema<IOnboardInterface>(
    {
        email: { type: String, required: true, unique: true },
        method: { type: String, enum: ['email', 'sms'], required: true },
        events: [
            {
                eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
                status: { type: String, enum: ['invited', 'accepted', 'rejected'], default: 'invited' },
            }
        ]
    },
    {
        timestamps: true,
    },
);

const OnboardInvitation = mongoose.model('onboardInvitation', onboardSchema);
export default OnboardInvitation;
