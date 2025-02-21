import IOrganization from './organization.interface';
import Organization from './organization.model';

// service for create organization
const createOrganization = async (data: Partial<IOrganization>) => {
  return await Organization.create(data);
};

// service for get all organization by creator
const getAllOrganizationsByCreator = async (id: string, skip: number, limit: number) => {
  return await Organization.find({ 'creator.creatorId': id }).skip(skip).limit(limit);
};

// service for delete organization by id
const deleteOrganizationById = async (id: string) => {
  return await Organization.deleteOne({ _id: id });
};

// service for retrive all organizations
const retriveAllOrganizations = async (skip: number, limit: number) => {
  return await Organization.find().skip(skip).limit(limit);
}

// service for update organization by id
const updateOrganizationById = async (id: string, data: Partial<IOrganization>) => {
  return await Organization.updateOne({ _id: id }, data, { runValidators: true });
}

// service for get specific organization by id
const getSpecificOrganizationById = async (id: string) => {
  return await Organization.findOne({ _id: id });
}

// service for retrive all organizations by specific connected volunteer
const getAllOrganizationsByConnectedVolunteer = async (id: string, skip: number, limit: number) => {
  return await Organization.find({ 'connectedVolunteers.volunteerId': id }).skip(skip).limit(limit);
}

export default {
  createOrganization,
  getAllOrganizationsByCreator,
  deleteOrganizationById,
  retriveAllOrganizations,
  updateOrganizationById,
  getSpecificOrganizationById,
  getAllOrganizationsByConnectedVolunteer
};
