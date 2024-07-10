// Import required modules and configuration
import express from "express";
import { addEvent, deleteEvent, getEvent, getFilteredEvents, updateEvent } from "../../controllers/event/event.controller.js";
import multer from 'multer';
// import { upload } from '../../config/multer.js'
import storage from '../../config/multer.js';
// Create a new router instance
const router = express.Router();
const upload = multer({ storage });

router.post("/add",
    upload.fields([{ name: 'images', maxCount: 5 }]),
    addEvent);


router.get("/get", getEvent);

router.patch("/update",
    upload.fields([{ name: 'images', maxCount: 5 }]),
    updateEvent);

router.delete("/delete", deleteEvent);

router.get("/filtered", getFilteredEvents);

// Export the router for use in the main application file
export default router; 