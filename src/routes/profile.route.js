// Import required modules and configuration
import path from 'path';
import multer from 'multer';
import express from "express";
import { resolve } from 'path';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import verifyToken from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile, deleteProfile } from "../controllers/profile.controller.js";

// Function to create directory if it doesn't exist
const createDirectoryIfNotExists = (directory) => {
    try {
        mkdirSync(directory, { recursive: true });
    } catch (error) {
        console.error(`Error creating directory: ${error}`);
    }
};

const storage = diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = resolve(`static/images/profile-images`);

        // Create directory if it doesn't exist
        createDirectoryIfNotExists(destinationPath);

        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        const userUid = req.user
        const ext = path.extname(file.originalname);
        const filename = `${userUid}${ext}`
        cb(null, filename);
    },
});

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

router.get("/get", verifyToken, getProfile);

router.patch("/update", verifyToken, upload.single('profileImage'), updateProfile);

router.delete("/delete", verifyToken, deleteProfile);

export default router;