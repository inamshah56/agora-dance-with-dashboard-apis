// Import required modules and configuration
import express from "express";
import { loginUser, registerUser, forgotPassword, verifyOtp, setNewPassword, regenerateAccessToken, updatePassword } from "../../controllers/auth/auth.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/regenerate-access-token", regenerateAccessToken);

router.post("/update-password", verifyToken, updatePassword);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/new-password", setNewPassword);

export default router;