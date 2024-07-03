// Import required modules and configuration
import express from "express";
import { test } from "../controllers/controller.js";

// Create a new router instance
const router = express.Router();

// Register route with input validation followed by the registration controller
router.get("/test", test);

// Export the router for use in the main application file
export default router; 