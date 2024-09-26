import dotenv from "dotenv";
dotenv.config();
import { getIPAddress } from "../utils/utils.js";
// ==========================================================
//                     Current Enviroment
// ==========================================================


const NODE_ENVIRONMENT = process.env.NODE_ENV || "local";

// ==========================================================
//                    Check Environment Variables
// ==========================================================
if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL in environment env file");
if (!process.env.DATABASE_NAME) throw new Error("Missing DATABASE_NAME in environment env file");
if (!process.env.JWT_SECRET_KEY) throw new Error("Missing JWT_SECRET_KEY in environment env file");
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID in environment");
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET in environment env file");
if (!process.env.FACEBOOK_CLIENT_ID) throw new Error("Missing FACEBOOK_CLIENT_ID in environment");
if (!process.env.FACEBOOK_CLIENT_SECRET) throw new Error("Missing FACEBOOK_CLIENT_SECRET in environment env file");
if (!process.env.AGORA_ADMIN_SDK) throw new Error("Missing AGORA_ADMIN_SDK in environment env file");
if (!process.env.EMAIL_PASS) throw new Error("Missing EMAIL_PASS in environment env file email will not work properly");
if (NODE_ENVIRONMENT === "production" && !process.env.DOMAIN) throw new Error("Missing DOMAIN in environment env file");

// ==========================================================
//                     Configuration Variables
// ==========================================================
const port = process.env.SERVER_PORT;
const dbUrl = process.env.DATABASE_URL + process.env.DATABASE_NAME;
const jwtSecret = process.env.JWT_SECRET_KEY;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
const firebaseAdminSdk = process.env.AGORA_ADMIN_SDK;
const emailPass = process.env.EMAIL_PASS;
const domain = NODE_ENVIRONMENT === "local" ? `http://${getIPAddress()}:${port}` : process.env.DOMAIN;



export {
    NODE_ENVIRONMENT,
    port,
    jwtSecret,
    dbUrl,
    googleClientId,
    googleClientSecret,
    facebookClientId,
    facebookClientSecret,
    firebaseAdminSdk,
    emailPass,
    domain,
};
