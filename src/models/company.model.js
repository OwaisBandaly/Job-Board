import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    website: String,
    location: String,
    logo: String,
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model("Company", companySchema);
