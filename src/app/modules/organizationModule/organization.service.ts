import IOrganization from './organization.interface';
import Organization from './organization.model';

// service for create organization
const createOrganization = async (data: Partial<IOrganization>) => {
  return await Organization.create(data);
};

// service for get all organization by creator
const getAllOrganizationsByCreator = async (id: string) => {
  return await Organization.find({ 'creator.creatorId': id });
};

// service for delete organization by id
const deleteOrganizationById = async (id: string) => {
  return await Organization.deleteOne({ _id: id });
};

export default {
  createOrganization,
  getAllOrganizationsByCreator,
  deleteOrganizationById,
};
