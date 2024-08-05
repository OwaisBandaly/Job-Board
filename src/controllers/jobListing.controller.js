import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { JobListing } from "../models/jobListing.model.js";
import { Company } from "../models/company.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const newJobListing = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { title, description, requirements, location, salary } = req.body;

  if (
    [title, description, requirements, location].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fileds are required");
  }

  const company = await Company.findOne({ _id: companyId });
  if (!company) {
    throw new ApiError(404, "You do not own this company");
  }

  const newJob = await JobListing.create({
    title,
    description,
    requirements,
    location,
    salary,
    company: companyId,
    postedBy: req.user?._id,
  });

  if (!newJob) {
    throw new ApiError(500, "Error while creating job");
  }

  return res.status(200).json(new ApiResponse(200, newJob, "Job listed!"));
});

const getAllJobListings = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const jobs = await JobListing.find({ company: companyId })
    .populate("company", "name location")
    .populate("postedBy", "username email");
  if (jobs.length === 0) {
    throw new ApiError(404, "No jobs found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, jobs, `${jobs.length} jobs found`));
});

const getAllJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const jobs = await JobListing.find({ _id: jobId })
    .populate("company", "name location")
    .populate("postedBy", "username email");
  if (jobs.length === 0) {
    throw new ApiError(404, "No jobs found");
  }

  return res.status(200).json(new ApiResponse(200, jobs, "success"));
});

const updateJobListing = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const updateFields = req.body;

  if (!mongoose.isValidObjectId(jobId)) {
    return res.status(400).json({ message: "Invalid jobId format" });
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  const job = await JobListing.findByIdAndUpdate(
    { _id: jobId },
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("title description requirements location salary");

  if (!job) {
    throw new ApiError(404, "JobListing not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, job, `${Object.keys(updateFields)} updated!`));
});

const deleteJobListing = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    return res.status(400).json({ message: "Invalid jobId format" });
  }

  const job = await JobListing.findByIdAndDelete({ _id: jobId });

  if (!job) {
    throw new ApiError(404, "No JobListing found!");
  }

  return res.status(200).json(new ApiResponse(200, {}, "JobListing deleted!"));
});

export {
  newJobListing,
  getAllJobListings,
  getAllJobById,
  updateJobListing,
  deleteJobListing,
};
