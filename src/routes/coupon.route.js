// Import required modules and configuration
import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import * as couponCtrl from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/all", verifyToken, couponCtrl.getAllCoupons);

router.post("/", verifyToken, couponCtrl.createCoupon);

router.post("/verify", verifyToken, couponCtrl.verifyCoupon);

export default router; 