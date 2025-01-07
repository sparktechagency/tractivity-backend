import { Document, Types } from "mongoose";

export interface INotification extends Document{
    senderId: Types.ObjectId,
    isDismissed: boolean,
    content: {
        type: string,
        message: string,
        consumerId: string
    }
}