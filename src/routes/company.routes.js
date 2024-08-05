import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isEmployer } from "../middlewares/checkRole.middleware.js";
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  updateCompany,
} from "../controllers/company.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT, isEmployer);

router
  .route("/new")
  .post(upload.fields([{ name: "logo", maxCount: 1 }]), createCompany);

router.route("/all").get(getAllCompanies);
router.route("/update/:companyId").patch(updateCompany);
router.route("/delete/:companyId").delete(deleteCompany);

export default router;
