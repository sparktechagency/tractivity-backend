import { Request, Response } from 'express';
import organizationService from './organization.service';
import CustomError from '../../errors';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import userServices from '../userModule/user.services';
import Organization from './organization.model';

// controller for create organization
const createOrganization = async (req: Request, res: Response) => {
  const organizationData = req.body;

  const creator = await userServices.getSpecificUser(organizationData.creatorId);
  if (!creator) {
    throw new CustomError.BadRequestError('No creator found by the creatorId!');
  }

  // check the creator has administrator permission
  if (!creator.roles.includes('administrator')) {
    throw new CustomError.BadRequestError('Creator does not have administrator permission!');
  }

  organizationData.creator = {
    creatorId: organizationData.creatorId,
    name: creator.fullName,
    creatorRole: 'administrator',
  };

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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const organizations = await organizationService.getAllOrganizationsByCreator(creatorId, skip, limit);
  //   if (!organizations) {
  //     throw new CustomError.NotFoundError('No organizations found for the creator!');
  //   }

  const totalOrganizations = organizations.length || 0;
  const totalPages = Math.ceil(totalOrganizations / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organization retrive successfull',
    meta: {
      totalData: totalOrganizations,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
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

// controller for retrive all organization
const retriveOrganizations = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const organizations = await organizationService.retriveAllOrganizations(skip, limit);

  const totalOrganizations = organizations.length || 0;
  const totalPages = Math.ceil(totalOrganizations / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizations retrive successfull',
    meta: {
      totalData: totalOrganizations,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: organizations,
  });
};

// controller for update specific organization
const updateSpecificOrganization = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organization = await organizationService.updateOrganizationById(id, req.body);
  if (!organization.modifiedCount) {
    throw new CustomError.BadRequestError('Failed to update organization!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organization update successfull',
  });
};

// controller for retrive all organizations by connected volunteer
const retriveAllOrganizationsByConnectedVolunteer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const organizations = await organizationService.getAllOrganizationsByConnectedVolunteer(id, skip, limit);

  const totalOrganizations = organizations.length || 0;
  const totalPages = Math.ceil(totalOrganizations / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizations retrive successfull',
    meta: {
      totalData: totalOrganizations,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: organizations,
  });
};

// controller for retrive organization where specific volunteer not included in those organizations
const retriveOrganizationsByNotConnectedVolunteer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  const skip = (page - 1) * limit;
  const organizations = await organizationService.getAllOrganizationsByNotConnectedVolunteer(id, skip, limit);

  const totalOrganizations = organizations.length || 0;
  const totalPages = Math.ceil(totalOrganizations / limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizations retrive successfull',
    meta: {
      totalData: totalOrganizations,
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    data: organizations,
  });
};

// controller for join organizations for specific volunteer
const joinOrganizations = async (req: Request, res: Response) => {
  const { volunteerId, organizations } = req.body;

  // Validate that organizations is an array
  if (!Array.isArray(organizations)) {
    throw new CustomError.BadRequestError('Organizations must be an array in request body!');
  }

  await Promise.all(
    organizations.map(async (orgId: string) => {
      await Organization.findByIdAndUpdate(
        orgId,
        { $addToSet: { connectedVolunteers: volunteerId } }, // Ensures unique addition
        { new: true }
      );
    })
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Volunteer joined organizations successfully',
  });
};


export default {
  createOrganization,
  retriveOrganizationsByCreatorId,
  deleteSpecificOrganization,
  retriveOrganizations,
  updateSpecificOrganization,
  retriveAllOrganizationsByConnectedVolunteer,
  retriveOrganizationsByNotConnectedVolunteer,
  joinOrganizations,
};
