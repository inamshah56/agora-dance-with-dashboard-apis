import { googleClientIdFrb } from "../config/initialConfig.js";
import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, } from "../utils/jwtTokenGenerator.js";
import { successOkWithData, frontError, validationError, catchError } from "../utils/responses.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(googleClientIdFrb);


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
        return res.status(200).send(getTokenResponseHtml(accessToken, refreshToken));

    } catch (error) {
        return catchError(res, error);
    }
}

// ========================= facebookCallback ===========================

export async function facebookCallback(req, res) {
    try {
        const { error } = req.query;
        const { id, name } = req.user;
        const email = `${id}@facebook.com`;
        let user = await User.findOne({ where: { email: email } });
        if (!user) {
            user = await User.create({
                first_name: name.split(" ")[0] || "no name",
                last_name: name.split(" ")[1] || null,
                email: email,
                password: "AB#123897",
            });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return res.status(200).send(getTokenResponseHtml(accessToken, refreshToken));
    } catch (error) {
        return catchError(res, error);
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
        return catchError(res, error);
    }
}


// ====================================================================
//                           OAUTH FUNCTIONS
// ====================================================================

// ========================= getTokenResponseHtml ===========================
const getTokenResponseHtml = (accessToken, refreshToken) => {
    const responseHtml = `
    <!DOCTYPE html>
    <html>
    <body>
        <h1>User authenticated successfully.</h1>
        <script>
            var response = {
                success: true,
                message: "Login successfull!",
                data: {
                    accessToken: "${accessToken}",
                    refreshToken: "${refreshToken}"
            }
            };

            // Sending JSON response to React Native WebView
            window.onload = function() {
                console.log("response", response);
                console.log("Sending response to React Native WebView");
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(response));
                }
            };
        </script>
    </body>
    </html>
    `
    return responseHtml;
}