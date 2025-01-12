// service for create donation
import IDonation from './donation.interface';
import Donation from './donation.model';

const createDonation = async (data: Partial<IDonation>) => {
  return await Donation.create(data);
};

// service for get all donations
const getAllDonations = async (skip: number, limit: number) => {
  return await Donation.find().skip(skip).limit(limit)
};

// service for get specific donation by id
const getSpecificDonationById = async (id: string) => {
  return await Donation.findById(id);
};

// service for retrive donations by specific doner id
const getDonationsByDonerId = async (donerId: string) => {
  return await Donation.find({ 'doner.donerId': donerId });
};

export default {
  createDonation,
  getAllDonations,
  getSpecificDonationById,
  getDonationsByDonerId
};
