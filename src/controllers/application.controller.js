import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/application.model.js";
import { JobListing } from "../models/jobListing.model.js";
import uploadOnCloudinary from "../utils/FileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const searchJobs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy,
    sortType,
    companyId,
  } = req.query;

  let pageNumber = parseInt(page);
  let pageSize = parseInt(limit);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw new ApiError(400, "Invalid page number");
  }
  if (isNaN(pageSize) || pageSize < 1) {
    throw new ApiError(400, "Invalid limit");
  }

  let filter = {};
  if (query) {
    filter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { requirements: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
    };
  }

  if (companyId) {
    if (mongoose.isValidObjectId(companyId)) {
      filter.company = companyId;
    } else {
      return res.status(400).json({ message: "Invalid companyId format" });
    }
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  }

  const jobs = await JobListing.find(filter)
    .sort(sort)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .populate("company", "name location")
    .populate("postedBy", "username email")
    .select("-createdAt -updatedAt");

  if (!jobs) {
    throw new ApiError(500, "Error while fetching videos");
  }

  const jobsCount = await JobListing.countDocuments(filter);

  if (jobsCount === 0) {
    return res.status(404).json({ message: "No jobs found" });
  }

  res.status(200).json(new ApiResponse(200, jobs, `${jobsCount} jobs found!`));
});

const applyForJob = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    const findJob = await JobListing.findById({ _id: jobId });
    if (!findJob) {
      throw new ApiError(404, "No jobs found!");
    }

    const resumeLocalPath = req.files?.resume[0]?.path;
    const resume = await uploadOnCloudinary(resumeLocalPath);

    const applyjob = await Application.create({
      resume: resume.url,
      job: jobId,
      applicant: req.user?._id,
      company: findJob.company,
    });

    if (!applyjob) {
      throw new ApiError(500, "Error while applying");
    }

    const appliedJob = await Application.find(applyjob._id)
      .populate("job", "title")
      .populate("applicant", "username email")
      .populate("company", "name location");

    return res
      .status(200)
      .json(new ApiResponse(200, appliedJob, "Applied for job successfully!"));
  } catch (error) {
    throw new ApiError(400, "Make sure to upload resume");
  }
});

const appliedJobs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }

  const jobs = await Application.find({ applicant: userId })
    .populate("job", "title location")
    .populate("applicant", "username email")
    .populate("company", "name location")
    .select("-createdAt -updatedAt");

  if (!jobs) {
    return res
      .status(400)
      .json({ message: "Your application list is currently empty" });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, jobs, `${jobs.length} job application found.`));
});

const viewJobApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.isValidObjectId(jobId)) {
    return res.status(400).json({ message: "Invalid jobId format" });
  }

  const applicants = await Application.find({ job: jobId })
    .populate("applicant", "username email")
    .populate("job", "title location")
    .populate("company", "name location")
    .select("-createdAt -updatedAt");

  if (!applicants) {
    throw new ApiError(404, "No applicants found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, applicants, `${applicants.length} applicant found!`)
    );
});

const applicationStatus = asyncHandler(async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid applicationID format" });
    }

    if (!status) {
      throw new ApiError(404, "Status is required");
    }

    const application = await Application.findByIdAndUpdate(
      { _id: applicationId },
      { $set: { status } },
      { new: true }
    )
      .populate("applicant", "username email")
      .populate("job", "title");

    if (!application) {
      throw new ApiError(404, "No applicants found!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, application, `Status Updated to ${status}`));
  } catch (error) {
    throw new ApiError(404, "Something went wrong, Try again");
  }
});

export {
  applyForJob,
  searchJobs,
  viewJobApplicants,
  applicationStatus,
  appliedJobs,
};
