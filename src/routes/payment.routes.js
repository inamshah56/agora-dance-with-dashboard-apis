import express from "express";
import { sendTestPaymentRequest } from "../controllers/payment.controller.js";


const router = express.Router();

// ======================= test payment redirect route =====================
router.get("/test", sendTestPaymentRequest);


export default router;