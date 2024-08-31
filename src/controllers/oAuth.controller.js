import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, } from "../utils/jwtTokenGenerator.js";
import { successOkWithData, frontError, validationError, catchError } from "../utils/responses.js";
import { OAuth2Client } from "google-auth-library";

// const googleClientId = process.env.GOOGLE_CLIENT_ID_WEB_FRB;
const googleClientId = process.env.GOOGLE_CLIENT_AGORA;
const googleClient = new OAuth2Client(googleClientId);


// ========================= googleCallback ===========================

export async function googleCallback(req, res) {
    try {
        const { email, family_name, given_name } = req.user;
        let user = await User.findOne({ where: { email: email } });
        if (!user) {
            user = await User.create({
                first_name: given_name,
                last_name: family_name,
                email: email,
                password: "AB#123897",
            });

        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return successOkWithData(res, "Login successful", { accessToken, refreshToken });

    } catch (error) {
        catchError(res, error);
    }
}


// ========================= googleLogin ===========================

export async function googleLogin(req, res) {
    try {
        const { idToken, fcmToken } = req.body;
        if (!idToken) {
            return frontError(res, "idToken obtained from google is required", "idToken");
        }
        if (!fcmToken) {
            return frontError(res, "Fcm token obtained from google is required", "fcmToken");
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID_WEB_FRB
        });
        const payload = ticket.getPayload();
        const { email, family_name, given_name } = payload;
        let user = await User.findOne({ where: { email: email } });
        if (!user) {
            user = await User.create({
                first_name: given_name,
                last_name: family_name,
                email: email,
                password: "AB#123897",
                fcm_token, fcmToken,

            });

        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return successOkWithData(res, "Login successful", { accessToken, refreshToken });

    } catch (error) {
        console.log("error==================", error);
        catchError(res, error);
    }
}