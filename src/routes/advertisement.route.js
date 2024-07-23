// Import required modules and configuration
import multer from 'multer';
import express from "express";
import storage from '../config/multer.js';
import verifyToken from "../middlewares/authMiddleware.js";
import { getAdvertisement, createAdvertisement, updateAdvertisement, deleteAdvertisement } from "../controllers/advertisement.controller.js";

const upload = multer({ storage });

const router = express.Router();

router.get("/get", verifyToken, getAdvertisement);

router.post("/create", verifyToken, upload.single('image'), createAdvertisement);

router.patch("/update", verifyToken, upload.single('image'), updateAdvertisement);

router.delete("/delete", verifyToken, deleteAdvertisement);

export default router;