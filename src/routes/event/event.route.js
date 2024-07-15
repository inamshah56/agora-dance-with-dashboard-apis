// Import required modules and configuration
import express from "express";
import { addEvent, deleteEvent, getEvent, getFilteredEvents, updateEvent, addToFavourites, removeFromFavourites, getAllFavourites } from "../../controllers/event/event.controller.js";
import multer from 'multer';
import storage from '../../config/multer.js';
import verifyToken from "../../middlewares/authMiddleware.js";

// Create a new router instance
const router = express.Router();
const upload = multer({ storage });

// ========================= events routes ===========================

router.post("/add", verifyToken,
    upload.fields([{ name: 'images', maxCount: 5 }]),
    addEvent);

router.get("/get", verifyToken, getEvent);

router.patch("/update", verifyToken,
    upload.fields([{ name: 'images', maxCount: 5 }]),
    updateEvent);

router.delete("/delete", verifyToken, deleteEvent);

router.get("/filtered", verifyToken, getFilteredEvents);

// ======================= fourite events routes ======================

router.post("/add-to-favourites", verifyToken, addToFavourites);

router.delete("/remove-from-favourites", verifyToken, removeFromFavourites);

router.get("/get-all-favourites", verifyToken, getAllFavourites);

// Export the router for use in the main application file
export default router; 