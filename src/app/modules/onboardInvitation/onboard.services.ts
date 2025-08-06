import OnboardInvitation from "./onboard.model";

type bodyType = {
    email: string;
    method: string;
} 

// service for create new onboard invitation
const createOnboardInvitation = async (body: bodyType) => {
    const onboardInvitation = new OnboardInvitation(body);
    return await onboardInvitation.save();
}

// service for get specific onboard invitation by email
const getOnboardInvitationByEmail = async (email: string) => {
    return await OnboardInvitation.findOne({ email });
}

export default {
    createOnboardInvitation,
    getOnboardInvitationByEmail
}