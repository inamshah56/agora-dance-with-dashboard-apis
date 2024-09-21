import dotenv from "dotenv";
dotenv.config();
import { getIPAddress } from "../utils/utils.js";
// ==========================================================
//                     Current Enviroment
// ==========================================================


const NODE_ENVIRONMENT = "production";

// ==========================================================
//                    Check Environment Variables
// ==========================================================
//if (!process.env.JWT_SECRET_KEY) throw new Error("Missing JWT_SECRET_KEY in environment env file");
//if (!process.env.GOOGLE_CLIENT_MOIN) throw new Error("Missing GOOGLE_CLIENT_MOIN in environment");
//if (!process.env.GOOGLE_CLIENT_SECRET_MOIN) throw new Error("Missing GOOGLE_CLIENT_SECRET_MOIN in environment env file");
//if (!process.env.DATABASE_NAME) throw new Error("Missing DATABASE_NAME in environment env file");
//if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL in environment env file");
//if (!process.env.AGORA_ADMIN_SDK) throw new Error("Missing AGORA_ADMIN_SDK in environment env file");
//if (!process.env.EMAIL_PASS) throw new Error("Missing EMAIL_PASS in environment env file email will not work properly");

// ==========================================================
//                     Configuration Variables
// ==========================================================
const port = process.env.SERVER_PORT || 3034;
const jwtSecret = process.env.JWT_SECRET_KEY;
const googleClientId = process.env.GOOGLE_CLIENT_AGORA;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET_AGORA;
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
const emailPass = process.env.EMAIL_PASS;
let domain = '';
let dbUrl = "";
let firebaseAdminSdk = "";
let googleClientIdFrb = "";
let googleClientSecretFrb = "";


// ==========================================================
//                    Set Configuration Variables
// ==========================================================


if (NODE_ENVIRONMENT === "moin") {
    dbUrl = process.env.MOIN_DATABASE_URL + process.env.MOIN_DATABASE_NAME;
    googleClientIdFrb = process.env.GOOGLE_CLIENT_ID_WEB_FRB_MOIN;
    googleClientSecretFrb = process.env.GOOGLE_CLIENT_SECRET_WEB_FRB_MOIN;
    firebaseAdminSdk = process.env.MOIN_ADMIN_SDK;
    domain = `http://${getIPAddress()}:${port}`
}
else if (NODE_ENVIRONMENT === "inam") {
    dbUrl = process.env.INAM_DATABASE_URL + process.env.DATABASE_NAME
    googleClientIdFrb = process.env.GOOGLE_CLIENT_ID_WEB_FRB_AGORA;
    googleClientSecretFrb = ""; // if needed then add it in .env file
    firebaseAdminSdk = process.env.AGORA_ADMIN_SDK
    domain = `http://${getIPAddress()}:${port}`
}

else if (NODE_ENVIRONMENT === "production") {
    dbUrl = process.env.DATABASE_URL + process.env.DATABASE_NAME
    googleClientIdFrb = process.env.GOOGLE_CLIENT_ID_WEB_FRB_AGORA;
    googleClientSecretFrb = ""; // if needed then add it in .env file
    firebaseAdminSdk = process.env.AGORA_ADMIN_SDK
    domain = `https://agronomics.pk/agora/api`
}

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
    googleClientIdFrb,
    googleClientSecretFrb,
    emailPass,
    domain,

};
