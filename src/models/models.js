import "./user.model.js";
import { Event } from "./event.model.js";
import "./ticket.model.js";
import "./advertisement.model.js";


await Event.sync({ alter: true }); // Recommended for development