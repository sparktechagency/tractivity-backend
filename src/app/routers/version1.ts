import express from 'express';
import userRouter from '../modules/userModule/user.routes';
import adminRouter from '../modules/adminModule/admin.routes';
import userAuthRouter from '../modules/authModule/userAuthModule/auth.routes';
import adminAuthRouter from '../modules/authModule/adminAuthModule/auth.routes';
import aboutUsRouter from '../modules/aboutUsModule/abountUs.routes';
import privacyPolicyRouter from '../modules/privacyPolicyModule/privacyPolicy.routes';
import termsConditionRouter from '../modules/termsConditionModule/termsCondition.routes';
import onboardingRouter from '../modules/onboardingModule/onboarding.routes';
import organizationRouter from '../modules/organizationModule/organization.routes';
import missionRouter from '../modules/missionModule/mission.routes';
import organizerRouter from '../modules/organizerModule/organizer.routes';
import volunteerRouter from '../modules/volunteerModule/volunteer.routes';
import donationRouter from '../modules/donationModule/donation.routes';
import friendshipRouter from '../modules/friendshipModule/friendship.routes';
import conversationRouter from '../modules/conversationModule/conversations.routes';
import messageRouter from '../modules/messageModule/message.routes';
import attachmentRouter from '../modules/attachmentModule/attachment.routes';
import dashboardRouter from '../modules/dashboardMatrix/dashboardMatrix.routes';

const routersVersionOne = express.Router();

routersVersionOne.use('/user', userRouter);
routersVersionOne.use('/user/auth', userAuthRouter);
routersVersionOne.use('/about-us', aboutUsRouter)
routersVersionOne.use('/privacy-policy', privacyPolicyRouter)
routersVersionOne.use('/terms-condition', termsConditionRouter)
routersVersionOne.use('/onboarding', onboardingRouter)
routersVersionOne.use('/organization', organizationRouter)
routersVersionOne.use('/mission', missionRouter)
routersVersionOne.use('/organizer', organizerRouter)
routersVersionOne.use('/volunteer', volunteerRouter)
routersVersionOne.use('/donation', donationRouter)
routersVersionOne.use('/friendship', friendshipRouter)
routersVersionOne.use('/conversation', conversationRouter)
routersVersionOne.use('/message', messageRouter)
routersVersionOne.use('/attachment', attachmentRouter)
routersVersionOne.use('/admin', adminRouter);
routersVersionOne.use('/admin/auth', adminAuthRouter);
routersVersionOne.use('/dashboard', dashboardRouter);

export default routersVersionOne;
