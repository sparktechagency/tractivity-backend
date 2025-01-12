import express from 'express';
import invitationControllers from '../invitationModule/invitation.controllers';
import eventControllers from '../eventModule/event.controllers';

const volunteerRouter = express.Router();

volunteerRouter.get('/join-invitation', invitationControllers.joinVolunteerToEvent)
volunteerRouter.get('/notification/:volunteerId', invitationControllers.retriveInvitationsByVolunteer)
volunteerRouter.get('/retrive/in-event', eventControllers.retriveSpecificVolunteerInEvent)
volunteerRouter.get('/event/search', eventControllers.searchEvents)
volunteerRouter.get('/event/:volunteerId/search', eventControllers.retriveEventsByVolunteer)
volunteerRouter.get('/event/retrive/mission/:id', eventControllers.retriveAllEventsByMissionId);
volunteerRouter.delete('/event/invitation/reject/:invitationId', invitationControllers.deleteEventInviation);
volunteerRouter.patch('/event/start-work', eventControllers.volunteerStartWork)
volunteerRouter.patch('/event/end-work', eventControllers.volunteerEndWork)

export default volunteerRouter;