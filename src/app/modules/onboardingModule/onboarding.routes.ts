import express from "express";
import onboardingController from "./onboarding.controller";

const onboardingRouter = express.Router();

onboardingRouter.post("/create", onboardingController.createOnboarding);
onboardingRouter.get("/retrive", onboardingController.retriveOnboarding);

export default onboardingRouter;