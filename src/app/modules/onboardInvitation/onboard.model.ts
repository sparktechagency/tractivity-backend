import mongoose from 'mongoose';
import { IOnboardInterface } from './onboard.interface';

const onboardSchema = new mongoose.Schema<IOnboardInterface>(
    {
        email: { type: String, required: true, unique: true },
        downloadLink: { type: String, required: true },
        method: { type: String, enum: ['email', 'sms'], required: true },
    },
    {
        timestamps: true,
    },
);

const OnboardInvitation = mongoose.model('onboardInvitation', onboardSchema);
export default OnboardInvitation;
