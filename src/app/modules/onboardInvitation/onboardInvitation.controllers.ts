import { Request, Response } from "express";
import asyncHandler from "../../../shared/asyncHandler";
import onboardInvitationServices from "./onboard.services";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import sendMail from "../../../utils/sendEmail";

// controller for create new onboard invitation
const createOnboardInvitation = asyncHandler(async (req: Request, res: Response) => {
    const { email, downloadLink, method } = req.body;
    const onboardInvitation = await onboardInvitationServices.createOnboardInvitation({ email, downloadLink, method });

    // send email with donwload link
    if (method === 'email') {
        const content = `Hello,\n\nJoin up app download link is ${downloadLink}\n\nThank you,\nJoin Up`;
        const mailOptions = {
            from: config.gmail_app_user as string,
            to: email,
            subject: 'Join Up - Onboard Invitation',
            text: content,
        };
        sendMail(mailOptions);
    }

    if (!onboardInvitation) {
        throw new Error('Failed to create onboard invitation!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Onboard invitation created successfull',
        data: onboardInvitation,
    });
});

export default {
    createOnboardInvitation,
}