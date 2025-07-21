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

// controller for retrieve schedules by organizer
const retrieveSchedulesByOrganizer = async (req: Request, res: Response) => {
  const organizerId = req.params.organizerId;

  if (!organizerId || !isValidObjectId(organizerId)) {
    throw new CustomError.BadRequestError('Valid organizer ObjectId is required!');
  }

  const schedules = await Schedule.find({ organizer: organizerId });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Schedules retrieved successfully',
    data: schedules,
  });
};

// controller for update schedule status
const updateScheduleStatus = async (req: Request, res: Response) => {
  const scheduleId = req.params.scheduleId;

  if (!scheduleId || !isValidObjectId(scheduleId)) {
    throw new CustomError.BadRequestError('Valid schedule ObjectId is required!');
  }

  const schedule = await Schedule.findById(scheduleId);

  if (!schedule) {
    throw new CustomError.NotFoundError('Schedule not found!');
  }

  await Schedule.findByIdAndUpdate(scheduleId, { isActive: !schedule.isActive });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Schedule status updated successfully',
  });
};

const updateSpecificSchedule = async (req: Request, res: Response) => {
  const scheduleId = req.params.scheduleId;

  // Validate scheduleId
  if (!scheduleId || !isValidObjectId(scheduleId)) {
    throw new CustomError.BadRequestError('Valid schedule ObjectId is required!');
  }

  const updateData = req.body;

  // Validate and normalize dates if present
  if (updateData.dates) {
    if (!Array.isArray(updateData.dates)) {
      throw new CustomError.BadRequestError('Dates must be an array!');
    }

    if (updateData.dates.length === 0) {
      throw new CustomError.BadRequestError('At least one date is required in the schedule!');
    }

    updateData.dates = updateData.dates.map((item: any) => {
      if (!item.dayName && item.date) {
        item.dayName = getDayNameFromDate(item.date);
      }
      return item;
    });
  }

  // Validate organizer if present
  if (updateData.organizer && !isValidObjectId(updateData.organizer)) {
    throw new CustomError.BadRequestError('Valid organizer ObjectId is required!');
  }

  // Perform the update with validation and return the new document
  const updatedSchedule = await Schedule.findByIdAndUpdate(scheduleId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedSchedule) {
    throw new CustomError.NotFoundError('Schedule not found!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Schedule updated successfully',
  });
};

export default {
  createSchedule,
  retrieveSchedulesByOrganizer,
  updateScheduleStatus,
  updateSpecificSchedule,
};
