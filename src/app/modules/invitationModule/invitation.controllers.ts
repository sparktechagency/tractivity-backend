import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import Invitation from "./invitation.model";
import CustomError from "../../errors";

// controller for retrive all invited missions of organizer
const getOrganizerInvitedMissions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const organizerInvitedMissions = await Invitation.find({consumerId: id, status: "invited"}).populate({
    path: 'contentId',
    select: 'name description creator.creatorRole createdAt'
  }).populate({
    path: 'inviterId',
    select: 'fullName image'
  })

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Organizer invited missions retrive successfull',
    data: organizerInvitedMissions,
  });
};

// controller for reject specific invitation
const rejectInvitation = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedInvitation = await Invitation.findByIdAndUpdate(id, { status: "rejected" }, { new: true });

  if (!updatedInvitation) {
    throw new CustomError.BadRequestError('Failed to reject invitation!');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    status: 'success',
    message: 'Invitation rejected successfull',
  });
};



export default {
  getOrganizerInvitedMissions,
  rejectInvitation
};