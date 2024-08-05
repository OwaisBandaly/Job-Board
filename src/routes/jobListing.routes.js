import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmployer } from "../middlewares/checkRole.middleware.js";
import {
  deleteJobListing,
  getAllJobById,
  getAllJobListings,
  newJobListing,
  updateJobListing,
} from "../controllers/jobListing.controller.js";

const router = Router();
router.use(verifyJWT, isEmployer);

router.route("/new-job/:companyId").post(newJobListing);
router.route("/all-jobs/:companyId").get(getAllJobListings);
router.route("/job-by-id/:jobId").get(getAllJobById);
router.route("/update/:jobId").patch(updateJobListing);
router.route("/delete/:jobId").delete(deleteJobListing);

export default router;
