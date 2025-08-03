import express from 'express';
import { Router } from 'express';
import onboardInvitationControllers from './onboardInvitation.controllers';

const onboardRouter = Router();
onboardRouter.post('/invite', onboardInvitationControllers.createOnboardInvitation);
// onboardRouter.get('/get-onboard-invitation/:email', onboardInvitationControllers.getOnboardInvitationByEmail);

export default onboardRouter;