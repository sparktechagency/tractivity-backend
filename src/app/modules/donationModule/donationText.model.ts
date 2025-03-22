import mongoose from 'mongoose';

const donationTextSchema = new mongoose.Schema(
  {
    text: String,
  },
  {
    timestamps: true,
  },
);

const DonationText = mongoose.model('donationText', donationTextSchema);
export default DonationText;
