import express from 'express';
import friendshipControllers from './friendship.controllers';
import authorization from '../../middlewares/authorization';

const friendshipRouter = express.Router();
friendshipRouter.use(authorization('super-admin', 'admin', 'user'))

friendshipRouter.post('/create', friendshipControllers.createFriendship);
friendshipRouter.get('/retrive/requested/:responderId/search', friendshipControllers.getAllRequestedFriendships);
friendshipRouter.get('/retrive/friends/:userId/search', friendshipControllers.getAllFriendshipByUserId);
friendshipRouter.patch('/accept/:friendshipId', friendshipControllers.acceptFriendship);
friendshipRouter.get('/retrive/organic-user/:userId/search', friendshipControllers.retriveOrganicUsersForInviteFriendship);

export default friendshipRouter;
