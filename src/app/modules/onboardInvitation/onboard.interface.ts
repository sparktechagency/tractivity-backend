import { Document } from "mongoose";

export interface IOnboardInterface extends Document {
    email: string;
    downloadLink: string;
    method: string;
}