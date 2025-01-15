import express from "express";
import dashboardMatrixControllers from "./dashboardMatrix.controllers";
import authorization from "../../middlewares/authorization";

const dashboardRouter = express.Router();

dashboardRouter.get('/metrixs/retrive', dashboardMatrixControllers.retrieveDashboardMatrix)

export default dashboardRouter;