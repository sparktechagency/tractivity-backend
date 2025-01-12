import express from 'express';
import friendshipControllers from './friendship.controllers';

const friendshipRouter = express.Router();

friendshipRouter.post('/create', friendshipControllers.createFriendship);
friendshipRouter.get('/retrive/requested/:responderId/search', friendshipControllers.getAllRequestedFriendships);
friendshipRouter.get('/retrive/friends/:userId/search', friendshipControllers.getAllFriendshipByUserId);
friendshipRouter.patch('/accept/:friendshipId', friendshipControllers.acceptFriendship);
friendshipRouter.get('/retrive/organic-user/:userId/search', friendshipControllers.retriveOrganicUsersForInviteFriendship);


export default friendshipRouter;
