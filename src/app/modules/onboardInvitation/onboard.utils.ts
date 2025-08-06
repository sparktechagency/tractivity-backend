import config from "../../../config";
import sendMail from "../../../utils/sendEmail";
import onboardInvitationServices from "./onboard.services";

export const createOnboardInvitation = async (payload: any) => {

    const onboardInvitation = await onboardInvitationServices.createOnboardInvitation(payload);

    // send email with donwload link
    if (payload.method === 'email') {
        const content = `Hello,\n\nJoin up app download links below: \n\n For Android: ${config.appstore}\n\n For iOS: ${config.appstore}\n\nThank you,\nJoin Up`;
        const mailOptions = {
            from: config.gmail_app_user as string,
            to: payload.email,
            subject: 'Join Up - Onboard Invitation',
            text: content,
        };
        sendMail(mailOptions);
    }

    if (!onboardInvitation) {
        throw new Error('Failed to create onboard invitation!');
    }
    return onboardInvitation;
}
