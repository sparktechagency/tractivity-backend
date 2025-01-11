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
    connectedOrganizations: string[];
    requestedOrganizers: string[];
    connectedOrganizers: string[];
}

export default IMission;