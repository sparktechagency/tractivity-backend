import mongoose from 'mongoose';
import { IOnboarding } from './onboarding.interface';

const onboardingSchema = new mongoose.Schema<IOnboarding>(
  {
    image: String,
  },
  {
    timestamps: true,
  },
);

const Onboarding = mongoose.model<IOnboarding>('onboarding', onboardingSchema);
export default Onboarding;
