// Import required modules and configuration
import express from "express";
import { loginUser, registerUser, forgotPassword, verifyOtp, setNewPassword, regenerateAccessToken, updatePassword } from "../../controllers/auth/auth.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/regenerate-access-token", verifyToken, regenerateAccessToken);

router.post("/update-password", verifyToken, updatePassword);

router.post("/forgot-password", verifyToken, forgotPassword);

router.post("/verify-otp", verifyToken, verifyOtp);

router.post("/new-password", verifyToken, setNewPassword);

export default router;