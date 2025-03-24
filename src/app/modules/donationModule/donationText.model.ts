import mongoose from 'mongoose';

const donationTextSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const DonationText = mongoose.model('donationText', donationTextSchema);
export default DonationText;
