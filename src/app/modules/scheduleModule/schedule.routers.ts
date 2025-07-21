import express from 'express';
import scheduleControllers from './schedule.controllers';

const scheduleRouter = express.Router();

scheduleRouter.post('/create', scheduleControllers.createSchedule);
scheduleRouter.get('/retrieve/organizer/:organizerId', scheduleControllers.retrieveSchedulesByOrganizer);
scheduleRouter.put('/update/status/:scheduleId', scheduleControllers.updateScheduleStatus);
scheduleRouter.patch('/update/:scheduleId', scheduleControllers.updateSpecificSchedule);

export default scheduleRouter;
