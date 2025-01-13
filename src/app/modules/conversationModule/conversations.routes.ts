import express from 'express';
import conversationControllers from './conversation.controllers';

const conversationRouter = express.Router();

conversationRouter.post('/create', conversationControllers.createConversation)
conversationRouter.get('/retrive/:userId', conversationControllers.retriveConversationsBySpecificUser)

export default conversationRouter;