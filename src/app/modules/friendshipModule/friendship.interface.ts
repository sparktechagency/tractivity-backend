import { Document, Types } from "mongoose";

export interface IFriendship extends Document{
    requester: {
        requesterId: Types.ObjectId,
        name: string
    },
    responder: {
        responderId: Types.ObjectId,
        name: string
    },
    status: string
}