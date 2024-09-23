// Import required modules and configuration
import express from "express";
import { loginUser, registerUser, forgotPassword, verifyOtp, setNewPassword, regenerateAccessToken, updatePassword, findUsersRealtime, getAllUsers, updateFcmToken } from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/authMiddleware.js";
import passport from "passport";
import "../strategies/googleStrategy.js";
import "../strategies/facebookStategy.js";
import { facebookCallback, googleCallback, googleLogin } from "../controllers/oAuth.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/regenerate-access-token", regenerateAccessToken);

router.patch("/fcm-token", verifyToken, updateFcmToken);

router.post("/update-password", verifyToken, updatePassword);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/new-password", setNewPassword);

router.get("/web/google", passport.authenticate("google", { scope: ["profile", "email", 'https://www.googleapis.com/auth/userinfo.profile'], session: false }));
router.get("/google/redirect", passport.authenticate("google", { session: false }), googleCallback);

router.get("/web/fb", passport.authenticate("facebook", { session: false }));
router.get("/fb/redirect", passport.authenticate("facebook", { session: false }), facebookCallback);



router.post("/mobile/google-login", googleLogin);

router.get("/users-realtime", findUsersRealtime);

router.get("/users-all", getAllUsers);

export default router;