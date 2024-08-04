import { Router } from "express";
import { changePassword, getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").patch(verifyJWT, logoutUser);
router.route("/change-password").patch(verifyJWT, changePassword);
router.route("/getuser").get(verifyJWT, getCurrentUser);

export default router;
