import IMission from "./mission.interface";
import Mission from "./mission.model";


// service for create mission
const createMission = async (data: Partial<IMission>) => {
  return await Mission.create(data);
};

// service for get specific missions by by
const getSpecificMissionsById = async (id: string) => {
  return await Mission.findOne({ _id : id });
};

// service for get all missions by creator
const getAllMissionsByCreator = async (id: string) => {
  return await Mission.find({ 'creator.creatorId': id });
};

// service for delete mission by id
const deleteMissionById = async (id: string) => {
  return await Mission.deleteOne({ _id: id });
};

export default {
  createMission,
  getSpecificMissionsById,
  getAllMissionsByCreator,
  deleteMissionById,
};
