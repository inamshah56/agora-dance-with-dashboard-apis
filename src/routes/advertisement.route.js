// Import required modules and configuration
import multer from 'multer';
import express from "express";
import storage from '../config/advertisementMulter.js';
import verifyToken from "../middlewares/authMiddleware.js";
import { getAdvertisement, createAdvertisement, updateAdvertisement, deleteAdvertisement } from "../controllers/advertisement.controller.js";

const upload = multer({
    storage,
    limits: { fileSize: 12 * 1024 * 1024 }, // Limit file size to 20MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mpquicktime|heic/i;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Unsupported file format"));
        }
    }
});

const router = express.Router();

router.get("/get", verifyToken, getAdvertisement);

router.post("/create", verifyToken, upload.single('image'), createAdvertisement);

router.patch("/update", verifyToken, upload.single('image'), updateAdvertisement);

router.delete("/delete", verifyToken, deleteAdvertisement);

export default router;