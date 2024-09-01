// Import required modules and configuration
import express from "express";
import chalk from "chalk";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import { NODE_ENVIRONMENT, port } from "./config/initialConfig.js";
import { connectDB } from "./config/dbConfig.js";
import "./models/models.js";
import authRoutes from "./routes/auth.route.js"; // Make sure you have this import for auth routes
import eventRoutes from "./routes/event.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import profileRoutes from "./routes/profile.route.js";
import advertisementRoutes from "./routes/advertisement.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import os from "os"
import path from "path"
import { fileURLToPath } from 'url';
import sendTestNotification from "./notifications/sendTestNotification.js";
import { getIPAddress } from "./utils/utils.js";

// Initializing the app
const app = express();
app.use(cookieParser());

// Essential security headers with Helmet
// Custom CSP configuration
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://sis-t.redsys.es:25443"],  // Example of allowing scripts from a specific domain
    styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles, if necessary
    imgSrc: ["'self'", "data:", "https://sis-t.redsys.es:25443"],  // Allow images from self, data URIs, and a specific domain
    formAction: ["'self'", "https://sis-t.redsys.es:25443"],  // Allow forms to be submitted to Redsys
    upgradeInsecureRequests: [],  // Auto-upgrade http to https if needed
  },
};
app.use(helmet());
app.use(helmet.contentSecurityPolicy(cspOptions));

// Enable CORS with default settings
app.use(cors());

// Logger middleware for development environment
if (NODE_ENVIRONMENT === "moin" || NODE_ENVIRONMENT === "inam") {
  app.use(morgan("dev"));
}

// Compress all routes
app.use(compression());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Built-in middleware for parsing JSON
app.use(express.json());

// static directories
// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/static', express.static(path.join(__dirname, '..', 'static')));

// Route for root path
app.get('/', (req, res) => {
  res.send("Welcome to Agora Dance");
});

// Route to send test notification 
app.post('/send-test-notification/', async (req, res) => {
  const fcmToken = req.body.fcmToken;
  if (!fcmToken) {
    return res.status(400).json({ message: "FCM token is required, key is 'fcmToken'" });
  }
  const response = await sendTestNotification(fcmToken, "This is title", "Body of the notification");
  res.status(200).json({ message: "Notification sent successfully", response });
});





// routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes)
app.use("/api/event", eventRoutes)
app.use("/api/ticket", ticketRoutes)
app.use("/api/advertisement", advertisementRoutes)
app.use("/api/payment", paymentRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error(chalk.red(err.stack));
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: {},
  });
});

// Database connection
connectDB();


// Server running
app.listen(port, () => {
  console.log(chalk.bgYellow.bold(` Server is listening at http://${getIPAddress()}:${port} `));
});