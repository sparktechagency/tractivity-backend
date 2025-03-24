import express from 'express';
import donationController from './donation.controller';
import authorization from '../../middlewares/authorization';

const donationRouter = express.Router();

donationRouter.use(authorization('super-admin', 'admin', 'user'))

donationRouter.post('/create', donationController.createDonation);
donationRouter.get('/retrive/all', donationController.getAllDonations);
donationRouter.get('/retrive/:id', donationController.getSpecificDonation);
donationRouter.get('/retrive/doner/:donerId', donationController.getDonationsByDonerId);
donationRouter.post('/text/create-or-update', donationController.createOrUpdateDonationText)
donationRouter.get('/text/retrieve', donationController.getDonationText)

export default donationRouter;
