import express from 'express';
import invitationControllers from '../invitationModule/invitation.controllers';
import eventRouter from '../eventModule/event.routes';
import authorization from '../../middlewares/authorization';

const organizerRouter = express.Router();

organizerRouter.use('/event', authorization('super-admin', 'admin', 'user'), eventRouter)
organizerRouter.get('/invited-missions/:id', authorization('super-admin', 'admin', 'user'), invitationControllers.getOrganizerInvitedMissions)
organizerRouter.patch('/reject-invitation/:id', authorization('super-admin', 'admin', 'user'), invitationControllers.rejectInvitation)

export default organizerRouter;