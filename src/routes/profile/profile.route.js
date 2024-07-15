// Import required modules and configuration
import express from "express";
import { updateProfile, deleteProfile } from "../../controllers/profile/profile.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";
import multer from 'multer';
import path from 'path';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { resolve } from 'path';



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

const upload = multer({ storage });


const router = express.Router();

router.patch("/update", verifyToken, upload.single('profileImage'), updateProfile);

router.delete("/delete", verifyToken, deleteProfile);

export default router;