import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/initialConfig.js";

// Function to generate access token
const generateAccessToken = (user) => {

    return jwt.sign({ userUid: user.uuid }, jwtSecret, {
        expiresIn: "30d",
    });
};

// Function to generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign({ userUid: user.uuid }, jwtSecret, {
        expiresIn: "120d",
    });
};

const verifyRefreshToken = (refreshToken) => {
    try {

        return jwt.verify(refreshToken, jwtSecret);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}

export { generateAccessToken, generateRefreshToken, verifyRefreshToken };
