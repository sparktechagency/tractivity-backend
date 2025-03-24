import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../../errors';
import donationServices from './donation.services';
import DonationText from './donationText.model';

// controller for create new donation
const createDonation = async (req: Request, res: Response) => {
  const donationData = req.body;
  const donation = await donationServices.createDonation(donationData);

  if (!donation) {
    throw new CustomError.BadRequestError('Failed to create new donation!');
  }

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Donation created successfully',
    data: donation,
  });
};

// controler for retrive all donations
const getAllDonations = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const donations = await donationServices.getAllDonations(skip, limit);

  const totalDonations = donations.length || 0;
  const totalPages = Math.ceil(totalDonations / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Donations retrive successfull',
    meta: {
      totalData: totalDonations,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: donations,
  });
};

// controller for retrive specific donation by id
const getSpecificDonation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const donation = await donationServices.getSpecificDonationById(id);

  if (!donation) {
    throw new CustomError.NotFoundError('No donation found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Donation retrive successfull',
    data: donation,
  });
};

// controller for retrive donations by specific donerId
const getDonationsByDonerId = async (req: Request, res: Response) => {
  const { donerId } = req.params;
  const donations = await donationServices.getDonationsByDonerId(donerId);

  if (!donations.length) {
    throw new CustomError.NotFoundError('No donations found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Donations retrive successfull',
    data: donations,
  });
};

// controller for add donation text for donation
const createOrUpdateDonationText = async (req: Request, res: Response) => {
  const { text } = req.body;
  const existingDonationText = await DonationText.findOne({});
  if (existingDonationText) {
    existingDonationText.text = text;
    await existingDonationText.save();
  } else {
    const newDonationText = new DonationText({ text: text });
    await newDonationText.save();
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Donation text updated successfully',
    data: existingDonationText,
  });
};

// controller for get donation text for donation
const getDonationText = async (req: Request, res: Response) => {
  const existingDonationText = await DonationText.findOne({});

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Donation text retrieved successfully',
    data: existingDonationText ? existingDonationText : null,
  });
};

export default {
  createDonation,
  getAllDonations,
  getSpecificDonation,
  getDonationsByDonerId,
  createOrUpdateDonationText,
  getDonationText,
};
