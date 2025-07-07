import express from 'express';
import scheduleControllers from './schedule.controllers';

const scheduleRouter = express.Router();

scheduleRouter.post('/create', scheduleControllers.createSchedule);

export default scheduleRouter;
