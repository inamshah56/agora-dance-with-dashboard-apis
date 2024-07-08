// Import required modules and configuration
import express from "express";
import chalk from "chalk";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import { nodeEnv, port } from "./config/initialConfig.js";
import { connectDB } from "./config/dbConfig.js";
import "./models/models.js";
import authRoutes from "./routes/auth/auth.route.js"; // Make sure you have this import for auth routes
import eventRoutes from "./routes/event/event.route.js";
import testRoute from "./routes/routes.js";
import os from "os"

// Initializing the app
const app = express();
app.use(cookieParser());

// Essential security headers with Helmet
app.use(helmet());

// Enable CORS with default settings
app.use(cors());

// Logger middleware for development environment
if (nodeEnv === "development") {
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

// Route for root path
app.get('/', (req, res) => {
  res.send("Welcome to Agora Dance");
});

// Use authentication routes
app.use("/api/auth", authRoutes);

// other routes
app.use("/api/test", testRoute)
app.use("/api/event", eventRoutes)

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

// Function to get the IP address of the server
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '0.0.0.0'; // fallback in case IP address cannot be determined
}

// Server running
app.listen(port, () => {
  console.log(chalk.bgYellow.bold(` Server is listening at http://${getIPAddress()}:${port} `));
});