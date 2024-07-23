// Import required modules and configuration
import express from "express";
import { loginUser, registerUser, forgotPassword, verifyOtp, setNewPassword, regenerateAccessToken, updatePassword } from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/authMiddleware.js";
import passport from "passport";
import "../strategies/googleStrategy.js";
import { googleCallback } from "../controllers/oAuth.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/regenerate-access-token", regenerateAccessToken);

router.post("/update-password", verifyToken, updatePassword);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/new-password", setNewPassword);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email", 'https://www.googleapis.com/auth/userinfo.profile'], session: false }));

router.get("/google/redirect", passport.authenticate("google", { session: false }), googleCallback);

export default router;