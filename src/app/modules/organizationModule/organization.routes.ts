import express from "express";
import organizationControllers from "./organization.controllers";

const organizationRouter = express.Router();

organizationRouter.post("/create", organizationControllers.createOrganization);
organizationRouter.get("/retrive/:creatorId", organizationControllers.retriveOrganizationsByCreatorId);
organizationRouter.delete("/delete/:id", organizationControllers.deleteSpecificOrganization);

export default organizationRouter;