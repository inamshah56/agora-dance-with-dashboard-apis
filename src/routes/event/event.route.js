// Import required modules and configuration
import express from "express";
import { addEvent } from "../../controllers/event/event.controller.js";

// Create a new router instance
const router = express.Router();

//  Route to handle adding an event
router.post("/add", addEvent);

// Export the router for use in the main application file
export default router;