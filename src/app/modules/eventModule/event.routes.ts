import express from 'express';
import eventControllers from './event.controllers';

const eventRouter = express.Router();

eventRouter.post('/create', eventControllers.createNewEvent);
eventRouter.get('/volunteer/mission/:missionId', eventControllers.searchVolunteers);
eventRouter.get('/retrive/search', eventControllers.retriveAllEvents);
eventRouter.get('/retrive/organizer/:id', eventControllers.retriveEventsByOrganizer);
eventRouter.get('/retrive/mission/:id', eventControllers.retriveAllEventsByMissionId);
eventRouter.delete('/delete/:id', eventControllers.deleteSpecificEvent);
eventRouter.patch('/deliver/:id', eventControllers.updateSpecificEvent);
eventRouter.get('/retrive/:id', eventControllers.retriveSpecificEventsById);

export default eventRouter;
