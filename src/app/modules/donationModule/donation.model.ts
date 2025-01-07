import mongoose from "mongoose";
import IDonation from "./donation.interface";

const donationSchema = new mongoose.Schema<IDonation>({
    
}, {
    timestamps: true,
    // versionKey: false
})