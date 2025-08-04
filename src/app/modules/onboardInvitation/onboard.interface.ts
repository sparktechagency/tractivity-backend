import { Document } from "mongoose";

export interface IOnboardInterface extends Document {
    email: string;
    method: string;
    events: [
        {
            eventId: string;
            status: string;
        }
    ];
}