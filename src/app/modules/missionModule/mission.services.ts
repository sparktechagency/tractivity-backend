import IMission from './mission.interface';
import Mission from './mission.model';

// service for create mission
const createMission = async (data: Partial<IMission>) => {
  return await Mission.create(data);
};

// service for get specific missions by by
const getSpecificMissionsById = async (id: string) => {
  return await Mission.findOne({ _id: id });
};

// service for get all missions by creator
const getAllMissionsByCreator = async (id: string) => {
  return await Mission.find({ 'creator.creatorId': id });
};

// service for delete mission by id
const deleteMissionById = async (id: string) => {
  return await Mission.deleteOne({ _id: id });
};

// service for get all mission by organization\
const getAllMissionsByOrganization = async (organizationId: string) => {
  // Query missions where the organization is connected
  const missions = await Mission.find({
    connectedOrganizations: { $in: [organizationId] },
  })
    .populate({
      path: 'connectedOrganizations',
      select: 'name creator',
    })
    .populate({
      path: 'connectedOrganizers',
      select: 'fullName email',
    });

  return missions;
};

export default {
  createMission,
  getSpecificMissionsById,
  getAllMissionsByCreator,
  deleteMissionById,
  getAllMissionsByOrganization,
};
