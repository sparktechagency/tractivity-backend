import express from "express";
import onboardingController from "./onboarding.controller";
import authorization from '../../middlewares/authorization';

const onboardingRouter = express.Router();

onboardingRouter.post("/create", authorization('super-admin', 'admin', 'user'), onboardingController.createOnboarding);
onboardingRouter.get("/retrive", authorization('super-admin', 'admin', 'user'), onboardingController.retriveOnboarding);

export default onboardingRouter;