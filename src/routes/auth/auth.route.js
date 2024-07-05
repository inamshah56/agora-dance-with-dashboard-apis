// Import required modules and configuration
import express from "express";
import { loginUser, registerUser } from "../../controllers/auth/auth.controller.js";
import { validateUserLogin, validateUserRegister } from "../../middlewares/validator/authValidator.js";

// Create a new router instance
const router = express.Router();

// Register route with input validation followed by the registration controller
// router.post("/register", validateUserRegister, registerUser);
router.post("/register", registerUser);

// Login route with input validation followed by the login controller
// router.post("/login", validateUserLogin, loginUser);
router.post("/login", loginUser);

// Export the router for use in the main application file
export default router;