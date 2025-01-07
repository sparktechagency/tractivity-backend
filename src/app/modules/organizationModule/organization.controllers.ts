import { Request, Response } from 'express';
import organizationService from './organization.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import userServices from '../userModule/user.services';

// controller for create organization
const createOrganization = async (req: Request, res: Response) => {
  const organizationData = req.body;

  const creator = await userServices.getSpecificUser(organizationData.creatorId);
  if(!creator){
    throw new CustomError.BadRequestError('No creator found by the creatorId!');
  }

  // check the creator has administrator permission
  if(!creator.roles.includes('administrator')){
    throw new CustomError.BadRequestError('Creator does not have administrator permission!');
  }

  organizationData.creator = {
    creatorId: organizationData.creatorId,
    name: creator.fullName,
    creatorRole: 'administrator',
  }

  const organization = await organizationService.createOrganization(organizationData);

  if (!organization) {
    throw new CustomError.BadRequestError('Failed to create organization!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    status: 'success',
    message: 'Organization creation successfull',
    data: organization,
  });
};

// controller for retrive organizations by creatorId
const retriveOrganizationsByCreatorId = async (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const organizations = await organizationService.getAllOrganizationsByCreator(creatorId);
  if (!organizations) {
    throw new CustomError.NotFoundError('No organizations found for the creator!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organization retrive successfull',
    data: organizations,
  });
};

// controller for delete specific organization
const deleteSpecificOrganization = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organization = await organizationService.deleteOrganizationById(id);
  if (!organization.deletedCount) {
    throw new CustomError.BadRequestError('Failed to delete organization!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organization delete successfull',
  });
};

export default {
  createOrganization,
  retriveOrganizationsByCreatorId,
  deleteSpecificOrganization
};
