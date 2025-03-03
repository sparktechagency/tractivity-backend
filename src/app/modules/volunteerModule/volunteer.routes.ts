import express from 'express';
import invitationControllers from '../invitationModule/invitation.controllers';
import eventControllers from '../eventModule/event.controllers';
import authorization from '../../middlewares/authorization';
import organizationControllers from '../organizationModule/organization.controllers';

const volunteerRouter = express.Router();

volunteerRouter.use(authorization('super-admin', 'admin', 'user'))

volunteerRouter.patch('/join-invitation', invitationControllers.joinVolunteerToEvent)
volunteerRouter.get('/notification/:volunteerId', invitationControllers.retriveInvitationsByVolunteer)
volunteerRouter.get('/retrive/in-event', eventControllers.retriveSpecificVolunteerInEvent)
volunteerRouter.get('/event/search', eventControllers.searchEvents)
volunteerRouter.get('/event/:volunteerId/search', eventControllers.retriveEventsByVolunteer)

volunteerRouter.get('/retrieve/organizations/volunteer/:id', organizationControllers.retriveAllOrganizationsByConnectedVolunteer);

volunteerRouter.get('/event/retrive/mission/:id', eventControllers.retriveAllEventsByMissionId);
volunteerRouter.delete('/event/invitation/reject/:invitationId', invitationControllers.deleteEventInviation);
volunteerRouter.patch('/event/start-work', eventControllers.volunteerStartWork)
volunteerRouter.patch('/event/end-work', eventControllers.volunteerEndWork)

volunteerRouter.patch('/mission/invitation/accept/:invitationId', invitationControllers.acceptMissionInviationForVolunteer)

// get all organizations where a specific volunteer not connected in those organizations connectedVolunteers
volunteerRouter.get('/retrieve/organizations/without/:id', organizationControllers.retriveOrganizationsByNotConnectedVolunteer);

// join organizations as specific volunteer
volunteerRouter.patch('/join-organization', organizationControllers.joinOrganizations)

export default volunteerRouter;