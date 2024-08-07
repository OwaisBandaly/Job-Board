import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isJobSeeker } from "../middlewares/checkRole.middleware.js";
import { isEmployer } from "../middlewares/checkRole.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  applicationStatus,
  appliedJobs,
  applyForJob,
  searchJobs,
  viewJobApplicants,
} from "../controllers/application.controller.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/apply/:jobId")
  .post(
    isJobSeeker,
    upload.fields([{ name: "resume", maxCount: 1 }]),
    applyForJob
  );

router.route("/search-jobs").get(isJobSeeker, searchJobs);
router.route("/applied-jobs").get(isJobSeeker, appliedJobs);
router.route("/applicants/:jobId").get(isEmployer, viewJobApplicants);
router.route("/status/:applicationId").patch(isEmployer, applicationStatus);

export default router;
