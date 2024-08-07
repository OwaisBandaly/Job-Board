import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema = new Schema(
  {
    job: {
      type: mongoose.Types.ObjectId,
      ref: "JobListing",
      required: true,
    },
    applicant: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    resume: {
      type: String,
      required: [true, "resume is required"],
    },
    status: {
      type: String,
      enum: ["applied", "interviewed", "offered", "rejected"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.plugin(mongooseAggregatePaginate);
export const Application = mongoose.model("Application", applicationSchema);
