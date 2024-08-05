import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Company } from "../models/company.model.js";
import uploadOnCloudinary from "../utils/FileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCompany = asyncHandler(async (req, res) => {
  const { name, description, website, location } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required!");
  }

  const logoLocalPath = req.files?.logo[0]?.path;
  const logo = await uploadOnCloudinary(logoLocalPath);

  const company = await Company.create({
    name,
    description,
    website,
    location,
    logo: logo.url,
    createdBy: req.user._id,
  });

  if (!company) {
    throw new ApiError(500, "Error while creating company");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, company, "Company registered!"));
});

const getAllCompanies = asyncHandler(async (req, res) => {
  const company = await Company.find({ createdBy: req.user?._id }).populate(
    "createdBy",
    "username email"
  );
  if (company.length === 0) {
    throw new ApiError(404, "No company created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, company, `${company.length} company found`));
});

const updateCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const updateFields = req.body;

  if (!mongoose.isValidObjectId(companyId)) {
    return res.status(400).json({ message: "Invalid jobId format" });
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(404, "Atleast one field is required");
  }

  const company = await Company.findByIdAndUpdate(
    { _id: companyId },
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-createdBy -createdAt");

  if (!company) {
    throw new ApiError(404, "Company not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, `${Object.keys(updateFields)} updated!`)
    );
});

const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  if (!mongoose.isValidObjectId(companyId)) {
    return res.status(400).json({ message: "Invalid jobId format" });
  }

  const company = await Company.findByIdAndDelete({ _id: companyId });

  if (!company) {
    throw new ApiError(404, "Company not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Company ${company?.name} Deleted!`));
});

export { createCompany, getAllCompanies, updateCompany, deleteCompany };
