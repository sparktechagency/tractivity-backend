import mongoose, { Document, Types } from "mongoose";

interface IMission extends Document{
    creator: {
        creatorId: Types.ObjectId,
        name: string;
        creatorRole: string;
        isActive: boolean;
    },
    name: string;
    description: string;
    // requestedOrganization: string[];
    connectedOrganization: string[];
    requestedOrganizer: string[];
    connectedOrganizer: string[];
}

export default IMission;