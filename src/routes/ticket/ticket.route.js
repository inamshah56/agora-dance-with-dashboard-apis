// Import required modules and configuration
import verifyToken from "../../middlewares/authMiddleware.js";
import { bookCongressTicket } from "../../controllers/ticket/ticket.controller.js";

// ========================= events routes ===========================

router.post("/book-ticket", verifyToken, bookCongressTicket);

// Export the router for use in the main application file
export default router; 