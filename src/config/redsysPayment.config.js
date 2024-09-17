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

const DS_MERCHANT_URLOK= `${domain}/api/payment/redsys/success`;
const DS_MERCHANT_URLKO= `${domain}/api/payment/redsys/error`;
const DS_MERCHANT_MERCHANTURL= `${domain}/api/payment/redsys/notification`;

const getRedsysConfig = () => {
    const ipAddress = getIPAddress();
    if (SANDBOX) {
        const config = {
            urls: SANDBOX_URLS,
            secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
            DS_MERCHANT_MERCHANTCODE: '999008881',
            DS_MERCHANT_TERMINAL: '1',
            DS_MERCHANT_MERCHANTNAME: 'Agroa Dance',
            DS_MERCHANT_URLOK,
            DS_MERCHANT_URLKO,
            DS_MERCHANT_MERCHANTURL,
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
            DS_MERCHANT_URLOK,
            DS_MERCHANT_URLKO,
            DS_MERCHANT_MERCHANTURL,
        }
        return config
    }
}
export { getRedsysConfig }