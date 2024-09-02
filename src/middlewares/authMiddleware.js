import jwt from "jsonwebtoken";
import { UnauthorizedError, forbiddenError } from "../utils/responses.js";
import { jwtSecret } from "../config/initialConfig.js";

// Middleware to validate JWT tokens
export default function verifyToken(req, res, next) {
  try {

    // Extract the token from the Authorization header
    let token = req.header("Authorization");

    if (!token) {
      return forbiddenError(res, 'No token, authorization denied');
    }
    token = token.replace("Bearer ", "")

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.userUid; // userUid is uuid
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    return UnauthorizedError(res, "Token is not valid")
  }
}