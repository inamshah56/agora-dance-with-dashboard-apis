// Import required modules and configuration
import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { getAllTickets, bookConcertTicket, bookCongressTicket } from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/get", verifyToken, getAllTickets);

router.post("/concert", verifyToken, bookConcertTicket);

router.post("/congress", verifyToken, bookCongressTicket);

export default router; 