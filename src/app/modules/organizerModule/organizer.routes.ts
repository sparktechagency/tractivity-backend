import express from 'express';
import invitationControllers from '../invitationModule/invitation.controllers';
import eventRouter from '../eventModule/event.routes';
import authorization from '../../middlewares/authorization';
import missionControllers from '../missionModule/mission.controllers';

const organizerRouter = express.Router();

organizerRouter.use('/event', authorization('super-admin', 'admin', 'user'), eventRouter);
organizerRouter.get(
  '/invited-missions/:id',
  authorization('super-admin', 'admin', 'user'),
  invitationControllers.getOrganizerInvitedMissions,
);

organizerRouter.patch('/reject-invitation/:id', authorization('super-admin', 'admin', 'user'), invitationControllers.rejectInvitation);

organizerRouter.patch(
  '/accept-invitation/:invitationId',
  authorization('super-admin', 'admin', 'user'),
  invitationControllers.acceptInvitation,
);

organizerRouter.get(
  '/all-missions/:organizerId',
  authorization('super-admin', 'admin', 'user'),
  missionControllers.getAllMissionsOfOrganizer,
);

organizerRouter.post(
  '/invite-volunteers/:missionId',
  authorization('super-admin', 'admin', 'user'),
  missionControllers.inviteVolunteersToMission,
);

organizerRouter.get(
  '/retrieve-volunteers/:missionId',
  authorization('super-admin', 'admin', 'user'),
  missionControllers.retrieveVolunteersForInvitation,
);

export default organizerRouter;
