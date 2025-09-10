import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import Schedule from './schedule.model';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import CustomError from '../../errors';
import getDayNameFromDate from '../../../utils/getDayFromDate';
import eventControllers from '../eventModule/event.controllers';
import eventServices from '../eventModule/event.services';

// controller for create new schedule
const createSchedule = async (req: Request, res: Response) => {
  const scheduleData = req.body;

  if (scheduleData.dates.length === 0) {
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

  if (!scheduleId || !isValidObjectId(scheduleId)) {
    throw new CustomError.BadRequestError('Valid schedule ObjectId is required!');
  }

  const updateData = req.body;

  // Validate organizer if present
  if (updateData.organizer && !isValidObjectId(updateData.organizer)) {
    throw new CustomError.BadRequestError('Valid organizer ObjectId is required!');
  }

  // Validate globalTime fields if isGlobalTime is true
  if (updateData.isGlobalTime === true) {
    const global = updateData.globalTime;

    if (!global) {
      throw new CustomError.BadRequestError('globalTime must be provided when isGlobalTime is true');
    }

    if (global.isAllDay === false) {
      if (
        !global.startTime ||
        !global.endTime ||
        typeof global.startTime !== 'string' ||
        typeof global.endTime !== 'string'
      ) {
        throw new CustomError.BadRequestError('globalTime.startTime and endTime must be provided when isAllDay is false');
      }
    }
  }

  // Validate and normalize dates
  if (updateData.dates) {
    if (!Array.isArray(updateData.dates)) {
      throw new CustomError.BadRequestError('Dates must be an array!');
    }

    if (updateData.dates.length === 0) {
      throw new CustomError.BadRequestError('At least one date is required!');
    }

    updateData.dates = updateData.dates.map((item: any, index: number) => {
      if (!item.dayName && item.date) {
        item.dayName = getDayNameFromDate(item.date);
      }

      // Validate endType rules
      if (item.endType === 'onDate' && !item.endOn) {
        throw new CustomError.BadRequestError(`'endOn' is required when endType is 'onDate' at index ${index}`);
      }

      if (item.endType === 'onCycle' && (item.endCycle === null || item.endCycle === undefined)) {
        throw new CustomError.BadRequestError(`'endCycle' is required when endType is 'onCycle' at index ${index}`);
      }

      // Validate innerTime if isGlobalTime is false
      if (updateData.isGlobalTime === false && item.innerTime.isAllDay === false) {
        const inner = item.innerTime;
        if (
          !inner ||
          typeof inner.startTime !== 'string' ||
          typeof inner.endTime !== 'string'
        ) {
          throw new CustomError.BadRequestError(`innerTime with startTime and endTime is required when isGlobalTime is false (at index ${index})`);
        }
      }

      return item;
    });
  }

  const updatedSchedule = await Schedule.findByIdAndUpdate(scheduleId, updateData, {
    new: true,
    runValidators: true,
  });

  if (updatedSchedule) {
    // changes all event status that used this schedule
    const events = await eventServices.retriveEventsBySchedule(scheduleId);
    
    await Promise.all(events.map((event: any) => {
      event.status = 'running';
      return event.save();
    }));
  }else{
    throw new CustomError.NotFoundError('Schedule not found!');
  }


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Schedule updated successfully',
    data: updatedSchedule,
  });
};

export default {
  createSchedule,
  retrieveSchedulesByOrganizer,
  updateScheduleStatus,
  updateSpecificSchedule,
};
