import express from "express";
import { redsysPaymentSuccess, redsysPayment, redsysPaymentNotification, redsysPaymentError, redsysPaymentTest } from "../controllers/payment.controller.js";


const router = express.Router();

// ======================= test payment redirect route =====================

router.get("/redsys/test", redsysPaymentTest);
router.get("/redsys/pay", redsysPayment);
router.get("/redsys/success", redsysPaymentSuccess);
router.get("/redsys/error", redsysPaymentError);
router.post("/redsys/notification/", redsysPaymentNotification);


export default router;