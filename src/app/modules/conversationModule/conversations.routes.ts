import express from 'express';
import conversationControllers from './conversation.controllers';
import authorization from '../../middlewares/authorization';

const conversationRouter = express.Router();
conversationRouter.use(authorization('super-admin', 'admin', 'user'))

conversationRouter.post('/create', conversationControllers.createConversation)
conversationRouter.get('/retrive/:userId', conversationControllers.retriveConversationsBySpecificUser)

export default conversationRouter;