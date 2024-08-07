import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isEmployer = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role === "employer") {
      return next();
    } else {
      return res.status(403).json({ message: "Access Denied, Employer only!" });
    }
  } catch (error) {
    console.log(error);
  }
})

export const isJobSeeker = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role === "jobSeeker") {
      return next();
    } else {
      return res.status(403).json({ message: "Access Denied, jobSeeker only!" });
    }
  } catch (error) {
    console.log(error);
  }
});
