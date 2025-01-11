import express from "express";
import missionControllers from "./mission.controllers";

const missionRouter = express.Router();

missionRouter.post("/create", missionControllers.createMission);
missionRouter.get("/retrive/:id", missionControllers.retriveSpecificMissionsById);
missionRouter.get("/retrive/creator/:creatorId", missionControllers.retriveMissionsByCreatorId);
missionRouter.delete("/delete/:id", missionControllers.deleteSpecificOMission);
missionRouter.get("/organization/search", missionControllers.searchOrganization);
missionRouter.get("/organizer/search", missionControllers.searchOrganizer);

export default missionRouter;