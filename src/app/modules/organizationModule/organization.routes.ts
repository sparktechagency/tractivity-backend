import express from "express";
import organizationControllers from "./organization.controllers";
import authorization from '../../middlewares/authorization';

const organizationRouter = express.Router();

organizationRouter.post("/create", authorization('user'), organizationControllers.createOrganization);

organizationRouter.get("/retrive/all", authorization('super-admin', 'admin', 'user'), organizationControllers.retriveOrganizations);

organizationRouter.get("/retrive/creator/:creatorId", authorization('super-admin', 'admin', 'user'), organizationControllers.retriveOrganizationsByCreatorId);

organizationRouter.delete("/delete/:id", authorization('super-admin', 'admin', 'user'), organizationControllers.deleteSpecificOrganization);

organizationRouter.patch("/update/:id", authorization('super-admin', 'admin', 'user'), organizationControllers.updateSpecificOrganization);

export default organizationRouter;