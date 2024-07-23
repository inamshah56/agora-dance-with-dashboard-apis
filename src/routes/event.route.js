// Import required modules and configuration
import multer from 'multer';
import express from "express";
import storage from '../config/multer.js';
import verifyToken from "../middlewares/authMiddleware.js";
import { addEvent, deleteEvent, getEvent, getFilteredEvents, updateEvent, addToFavourites, removeFromFavourites, getAllFavourites, addConcertPass, addCongressPass, addCongressRooms, addCongressFood, getEventBookingDetails } from "../controllers/event.controller.js";

const upload = multer({ storage });

// Create a new router instance
const router = express.Router();

// ========================= events routes ===========================

router.get("/get", verifyToken, getEvent);

router.post("/add", verifyToken,
    upload.fields([{ name: 'images', maxCount: 5 }]),
    addEvent);

router.patch("/update", verifyToken,
    upload.fields([{ name: 'images', maxCount: 5 }]),
    updateEvent);

router.delete("/delete", verifyToken, deleteEvent);

router.get("/filtered", verifyToken, getFilteredEvents);

router.get("/booking-details", verifyToken, getEventBookingDetails);

// ======================= favourite events routes =====================

router.get("/get-all-favourites", verifyToken, getAllFavourites);

router.post("/add-to-favourites", verifyToken, addToFavourites);

router.delete("/remove-from-favourites", verifyToken, removeFromFavourites);

// ========================= passes routes ===========================

router.post("/add-concert-pass", verifyToken, addConcertPass);

router.post("/add-congress-pass", verifyToken, addCongressPass);

// ========================== rooms routes ===========================

router.post("/add-congress-rooms", verifyToken, addCongressRooms);

// =========================== food routes ===========================

router.post("/add-congress-food", verifyToken, addCongressFood);


// Export the router for use in the main application file
export default router; 