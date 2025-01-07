import { Document, Types } from "mongoose";

interface IOrganization extends Document{
    creator: {
        creatorId: Types.ObjectId,
        name: string;
        creatorRole: string;
        isActive: boolean;
    },
    name: string;
    description: string;
}

export default IOrganization;