import express from 'express';
import eventControllers from './event.controllers';

const eventRouter = express.Router();

eventRouter.post('/create', eventControllers.createNewEvent);
eventRouter.get('/volunteer/mission/:missionId', eventControllers.searchVolunteers);
eventRouter.get('/retrive/search', eventControllers.retriveAllEvents);
eventRouter.get('/retrive/organizer/:id', eventControllers.retriveEventsByOrganizer);
eventRouter.get('/retrive/mission/:id', eventControllers.retriveAllEventsByMissionId);
eventRouter.get('/retrive/report/mission/:missionId', eventControllers.retriveAllEventsReportByMission);
eventRouter.patch('/update/:id', eventControllers.editEvent);

eventRouter.delete('/delete/:id', eventControllers.deleteSpecificEvent);
eventRouter.patch('/deliver/:id', eventControllers.updateSpecificEvent);
eventRouter.get('/retrive/:id', eventControllers.retriveSpecificEventsById);

export default eventRouter;
