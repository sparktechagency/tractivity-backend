import express from 'express';
import invitationControllers from '../invitationModule/invitation.controllers';
import eventRouter from '../eventModule/event.routes';

const organizerRouter = express.Router();

organizerRouter.use('/event', eventRouter)
organizerRouter.get('/invited-missions/:id', invitationControllers.getOrganizerInvitedMissions)
organizerRouter.patch('/reject-invitation/:id', invitationControllers.rejectInvitation)

export default organizerRouter;