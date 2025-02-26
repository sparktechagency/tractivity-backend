import express from "express";
import missionControllers from "./mission.controllers";
import authorization from '../../middlewares/authorization';

const missionRouter = express.Router();

missionRouter.post("/create", authorization('super-admin', 'admin', 'user'), missionControllers.createMission);
missionRouter.get("/retrive/:id", authorization('super-admin', 'admin', 'user'), missionControllers.retriveSpecificMissionsById);
missionRouter.get("/retrive/creator/:creatorId", authorization('super-admin', 'admin', 'user'), missionControllers.retriveMissionsByCreatorId);
missionRouter.delete("/delete/:id", authorization('super-admin', 'admin', 'user'), missionControllers.deleteSpecificOMission);

missionRouter.patch("/update/:id", authorization('super-admin', 'admin', 'user'), missionControllers.updateSpecificMission);

missionRouter.get("/organization/search", authorization('super-admin', 'admin', 'user'), missionControllers.searchOrganization);
missionRouter.get("/organizer/search", authorization('super-admin', 'admin', 'user'), missionControllers.searchOrganizer);
missionRouter.get("/retrive/organization/:organizationId", authorization('super-admin', 'admin', 'user'), missionControllers.retriveMissionsByOrganization);

missionRouter.delete("/remove/organizer/:missionId", authorization('super-admin', 'admin', 'user'), missionControllers.removeOrganizerFromMission);

export default missionRouter;