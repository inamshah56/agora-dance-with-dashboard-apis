import dotenv from "dotenv";
dotenv.config();
// ==========================================================
//                     Current Enviroment
// ==========================================================


const NODE_ENVIRONMENT = "moin";

// ==========================================================
//                    Check Environment Variables
// ==========================================================
if (!process.env.JWT_SECRET_KEY) throw new Error("Missing JWT_SECRET_KEY in environment env file");
if (!process.env.GOOGLE_CLIENT_MOIN) throw new Error("Missing GOOGLE_CLIENT_MOIN in environment");
if (!process.env.GOOGLE_CLIENT_SECRET_MOIN) throw new Error("Missing GOOGLE_CLIENT_SECRET_MOIN in environment env file");
if (!process.env.DATABASE_NAME) throw new Error("Missing DATABASE_NAME in environment env file");
if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL in environment env file");
if (!process.env.AGORA_ADMIN_SDK) throw new Error("Missing AGORA_ADMIN_SDK in environment env file");
if (!process.env.EMAIL_PASS) throw new Error("Missing EMAIL_PASS in environment env file email will not work properly");

// ==========================================================
//                     Configuration Variables
// ==========================================================
const port = process.env.SERVER_PORT || 3034;
const jwtSecret = process.env.JWT_SECRET_KEY;
const googleClientId = process.env.GOOGLE_CLIENT_MOIN;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET_MOIN;
const emailPass = process.env.EMAIL_PASS;
const domain = process.env.DOMAIN;
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
}
else if (NODE_ENVIRONMENT === "inam") {
    dbUrl = process.env.INAM_DATABASE_URL + process.env.DATABASE_NAME
    googleClientIdFrb = process.env.GOOGLE_CLIENT_ID_WEB_FRB_AGORA;
    googleClientSecretFrb = ""; // if needed then add it in .env file
    firebaseAdminSdk = process.env.AGORA_ADMIN_SDK
}

else if (NODE_ENVIRONMENT === "production") {
    dbUrl = process.env.DATABASE_URL + process.env.DATABASE_NAME || "postgresql://postgres:greenage@192.168.100.17:5432/project2"
    googleClientIdFrb = process.env.GOOGLE_CLIENT_ID_WEB_FRB_AGORA;
    googleClientSecretFrb = ""; // if needed then add it in .env file
    firebaseAdminSdk = process.env.AGORA_ADMIN_SDK
}

export { NODE_ENVIRONMENT, port, jwtSecret, dbUrl, googleClientId, googleClientSecret, firebaseAdminSdk, googleClientIdFrb, googleClientSecretFrb, emailPass, domain };
