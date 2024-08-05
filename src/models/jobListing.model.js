import mongoose, {Schema} from "mongoose";

const jobListingSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        requirements: String,
        location: {
            type: String,
            required: true,
        },
        salary: {
            type: Number,
            default: "Not disclosed"
        },
        company: {
            type: mongoose.Types.ObjectId,
            ref: "Company",
            required: true
        },
        postedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        datePosted: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)


export const JobListing = mongoose.model("JobListing", jobListingSchema)