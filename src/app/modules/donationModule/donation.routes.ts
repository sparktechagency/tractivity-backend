import express from 'express';
import donationController from './donation.controller';
import authorization from '../../middlewares/authorization';

const donationRouter = express.Router();

donationRouter.use(authorization('super-admin', 'admin', 'user'))

donationRouter.post('/create', donationController.createDonation);
donationRouter.get('/retrive/all', donationController.getAllDonations);
donationRouter.get('/retrive/:id', donationController.getSpecificDonation);
donationRouter.get('/retrive/doner/:donerId', donationController.getDonationsByDonerId);

export default donationRouter;
