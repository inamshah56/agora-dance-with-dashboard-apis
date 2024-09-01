import { createRedsysAPI, SANDBOX_URLS, PRODUCTION_URLS } from "redsys-easy";
import { getIPAddress } from "../utils/utils.js";
import { port, domain } from "./initialConfig.js";
import dotenv from "dotenv";
dotenv.config();
// ========================================
//               PAYMENT ENVIROMENT
// ========================================
const SANDBOX = true;

// ========================================
//               REDSYS CONFIG
// ========================================

const getRedsysConfig = () => {
    const ipAddress = getIPAddress();
    if (SANDBOX) {
        const config = {
            urls: SANDBOX_URLS,
            secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
            DS_MERCHANT_MERCHANTCODE: '999008881',
            DS_MERCHANT_TERMINAL: '1',
            DS_MERCHANT_MERCHANTNAME: 'Agroa Dance',
            DS_MERCHANT_URLOK: `http://${ipAddress}:${port}/api/payment/redsys/success`,
            DS_MERCHANT_URLKO: `http://${ipAddress}:${port}/api/payment/redsys/error`,
            DS_MERCHANT_MERCHANTURL: `http://${ipAddress}:${port}/api/payment/redsys/notification`,
        }
        return config
    }
    else {
        const config = {
            urls: PRODUCTION_URLS,
            secretKey: process.env.MERCHANT_SECRET_KEY,
            DS_MERCHANT_MERCHANTCODE: process.env.DS_MERCHANT_MERCHANTCODE,
            DS_MERCHANT_TERMINAL: '001',
            DS_MERCHANT_MERCHANTNAME: 'Agroa Dance',
            DS_MERCHANT_URLOK: `https://agronomics.pk/agora/api/payment/redsys/success`,
            DS_MERCHANT_URLKO: `https://agronomics.pk/agora/api/payment/redsys/error`,
            DS_MERCHANT_MERCHANTURL: `https://agronomics.pk/agora/api/payment/redsys/notification`,
        }
        return config
    }
}
export { getRedsysConfig }