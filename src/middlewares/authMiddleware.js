import jwt from "jsonwebtoken";
import { UnauthorizedError, forbiddenError } from "../utils/responses.js";

// Middleware to validate JWT tokens
export default function verifyToken(req, res, next) {
  try {

    // Extract the token from the Authorization header
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return forbiddenError(res, 'No token, authorization denied');
    }

    console.log("Token :", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    return UnauthorizedError(res, "Token is not valid")
  }
}