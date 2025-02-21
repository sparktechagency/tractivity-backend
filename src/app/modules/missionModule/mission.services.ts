import IMission from './mission.interface';
import Mission from './mission.model';

// service for create mission
const createMission = async (data: Partial<IMission>) => {
  return await Mission.create(data);
};

// service for get specific missions by by
const getSpecificMissionsById = async (id: string) => {
  return await Mission.findOne({ _id: id }).populate([
    {
      path: 'connectedOrganizations',
      select: '',
    },
    {
      path: 'requestedOrganizers',
      select: 'image fullName profession',
    },
    {
      path: 'connectedOrganizers',
      select: '_id image fullName profession',
    },
    {
      path: 'connectedVolunteers',
      select: 'image fullName profession',
    },
    {
      path: 'requestedVolunteers',
      select: 'image fullName profession',
    },
  ]);
};

// service for get all missions by creator
const getAllMissionsByCreator = async (id: string) => {
  return await Mission.find({ 'creator.creatorId': id }).select('_id name description connectedOrganizers mode').populate({
    path: 'connectedOrganizers',
    select: 'fullName',
  });
};

// service for delete mission by id
const deleteMissionById = async (id: string) => {
  return await Mission.deleteOne({ _id: id });
};

// service for update specific mission
const updateSpecificMission = async (id: string, data: Partial<IMission>) => {
  return await Mission.findOneAndUpdate({ _id: id }, data, { new: true });
};

// service for get all mission by organization\
const getAllMissionsByOrganization = async (organizationId: string) => {
  // Query missions where the organization is connected
  const missions = await Mission.find({
    connectedOrganizations: { $in: [organizationId] },
  }).populate([
    {
      path: 'connectedOrganizations',
      select: 'name description',
    },
    {
      path: 'connectedOrganizers',
      select: 'fullName email',
    },
    {
      path: 'requestedOrganizers',
      select: 'image fullName profession',
    },
    {
      path: 'connectedVolunteers',
      select: 'image fullName profession',
    },
    {
      path: 'requestedVolunteers',
      select: 'image fullName profession',
    },
  ]);

  return missions;
};

// service for get all mission by organizer and status
const getAllMissionsByOrganizerAndStatus = async (organizerId: string, status: string, skip: number, limit: number) => {
  return await Mission.find({
    connectedOrganizers: { $in: [organizerId] },
    status,
  })
    .skip(skip)
    .limit(limit)
    .populate([
      {
        path: 'connectedOrganizations',
        select: 'name description',
      },
      {
        path: 'connectedOrganizers',
        select: 'image fullName profession',
      },
      {
        path: 'requestedOrganizers',
        select: 'image fullName profession',
      },
      {
        path: 'connectedVolunteers',
        select: 'image fullName profession',
      },
      {
        path: 'requestedVolunteers',
        select: 'image fullName profession',
      },
    ]);
};

export default {
  createMission,
  getSpecificMissionsById,
  getAllMissionsByCreator,
  deleteMissionById,
  updateSpecificMission,
  getAllMissionsByOrganization,
  getAllMissionsByOrganizerAndStatus,
};
