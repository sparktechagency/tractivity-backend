import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import Schedule from './schedule.model';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import CustomError from '../../errors';
import getDayNameFromDate from '../../../utils/getDayFromDate';

// controller for create new schedule
const createSchedule = async (req: Request, res: Response) => {
  const scheduleData = req.body;

  if(scheduleData.dates.length === 0){
    throw new CustomError.BadRequestError('At least one date is required in the schedule!');
  }

  if (!scheduleData.organizer || !isValidObjectId(scheduleData.organizer)) {
    throw new CustomError.BadRequestError('Valid organizer ObjectId is required!');
  }

  if (!Array.isArray(scheduleData.dates)) {
    throw new CustomError.BadRequestError('Dates must be an array!');
  }

  // Normalize & validate each date entry
  scheduleData.dates = scheduleData.dates.map((item: any) => {
    // Set dayName if missing
    if (!item.dayName && item.date) {
      item.dayName = getDayNameFromDate(item.date);
    }

    return item;
  });

  const schedule = await Schedule.create(scheduleData);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Schedule created successfully',
    data: schedule,
  });
};

export default {
  createSchedule,
};
