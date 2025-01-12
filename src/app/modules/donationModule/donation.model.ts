import mongoose from "mongoose";
import IDonation from "./donation.interface";

const donationSchema = new mongoose.Schema<IDonation>({
    doner: {
        donerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        name: {
            type: String,
            required: true
        },
        donerRole: {
            type: String,
            required: true
        }
    },
    email: String,
    firstName: String,
    lastName: String,
    country: String,
    state: String,
    amount: {
        value: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: {
                values: ['USD'],
                message: 'Currency must be USD'
            },
            default: "USD"
        }
    },
    source: {
        type: {
            type: String,
            enum: {
                values: ['card', 'intenet-banking', 'mobile-wallet'],
                message: '{VALUE} is not accepted as a source value. Use card/internet-banking/mobile-wallet.'
            },
        },
        number: {
            type: String
        },
        transactionId: {
            type: String
        }
    },
    isUSBanks: Boolean,
}, {
    timestamps: true,
    // versionKey: false
})

const Donation = mongoose.model<IDonation>("donation", donationSchema);
export default Donation;