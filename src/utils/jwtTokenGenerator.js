import jwt from "jsonwebtoken";

// Function to generate access token
const generateAccessToken = (user) => {
    return jwt.sign({ userUid: user.uuid }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// Function to generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign({ userUid: user.uuid }, process.env.JWT_SECRET, {
        expiresIn: "120d",
    });
};

const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}

export { generateAccessToken, generateRefreshToken, verifyRefreshToken };
