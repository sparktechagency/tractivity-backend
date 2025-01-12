import Invitation from './invitation.model';

// service for retrive initation by consumenId
const retriveInvitationByConsumerId = async (id: string) => {
  return await Invitation.findOne({ consumerId: id });
};

// service for retrive initation by id
const retriveInvitationById = async (id: string) => {
  return await Invitation.findOne({ _id: id });
};

export default {
  retriveInvitationByConsumerId,
  retriveInvitationById
};
