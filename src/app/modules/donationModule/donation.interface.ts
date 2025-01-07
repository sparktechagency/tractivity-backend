import { Document, Types } from 'mongoose';

interface IDonation extends Document {
  doner: {
    donerId: Types.ObjectId;
    name: string;
    donerRole: string;
  };
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  amount: {
    value: number;
    currency: string;
  };
  source: {
    type: string;
    number: string;
    transactionId: string;
  },
  isUSBanks: boolean;
}

export default IDonation;
