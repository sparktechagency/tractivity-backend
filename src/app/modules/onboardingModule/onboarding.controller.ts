import { Request, Response } from 'express';
import CustomError from '../../errors';
import Onboarding from './onboarding.model';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import fileUploader from '../../../utils/fileUploader';
import { FileArray } from 'express-fileupload';

// controller for create onboarding
const createOnboarding = async (req: Request, res: Response) => {
  const onboardingData = req.body;
  const files = req.files;

  const exitOnboarding = await Onboarding.findOne();

  const imagePath = await fileUploader(files as FileArray, 'onboarding-image', 'image');
  onboardingData.image = imagePath;

  let onboarding;

  if (!exitOnboarding) {
    onboarding = await Onboarding.create(onboardingData);

    if (!onboarding) {
      throw new CustomError.BadRequestError('Failed to create new onboarding!');
    }

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      status: 'success',
      message: 'Onboarding created successfully',
      data: onboarding,
    });
  } else {
    onboarding = await Onboarding.updateOne({ _id: exitOnboarding._id }, onboardingData, { new: true });

    if (!onboarding.modifiedCount) {
      throw new CustomError.BadRequestError('Failed to update onboarding!');
    }

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Onboarding updated successfully',
    });
  }
};

// controller for retrive onboarding
const retriveOnboarding = async (req: Request, res: Response) => {
  const onboarding = await Onboarding.findOne();

  if (!onboarding) {
    throw new CustomError.NotFoundError('Onboarding not found!');
  }

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Onboarding retrive successfully',
    data: onboarding,
  });
};

export default {
  createOnboarding,
  retriveOnboarding
};
