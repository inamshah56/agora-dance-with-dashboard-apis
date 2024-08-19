import axios from "axios"
import { successOkWithData, catchError } from "../utils/responses.js"

// ========================= sendPaymentRequest ===========================

const sendTestPaymentRequest = async (req, res) => {
    const payload = {
        "Ds_SignatureVersion": "HMAC_SHA256_V1",
        "Ds_Signature": "PqV2+SF6asdasMjXasKJRTh3UIYya1hmU/igHkzhC+R=",
        "Ds_MerchantParameters": "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiAiMTQ1IiwiRFNfTUVSQ0hBTlRfQ1VSUkVOQ1kiOiAiOTc4IiwiRFNfTUVSQ0hBTlRfTUVSQ0hBTlRDT0RFIjogIjk5OTAwODg4MSIsIkRTX01FUkNIQU5UX01FUkNIQU5UVVJMIjogImh0dHA6Ly93d3cucHJ1ZWJhLmNvbS91cmxOb3RpZmljYWNpb24ucGhwIiwiRFNfTUVSQ0hBTlRfT1JERVIiOiAiMTQ0NjA2ODU4MSIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjogIjEiLCJEU19NRVJDSEFOVF9UUkFOU0FDVElPTlRZUEUiOiAiMCIsIkRTX01FUkNIQU5UX1VSTEtPIjogImh0dHA6Ly93d3cucHJ1ZWJhLmNvbS91cmxLTy5waHAiLCJEU19NRVJDSEFOVF9VUkxPSyI6ICJodHRwOi8vd3d3LnBydWViYS5jb20vdXJsT0sucGhwIn0="
    }

    try {
        const response = await axios.post('https://sis-t.redsys.es:25443/sis/realizarPago', payload)
        console.log(response.data)
        return successOkWithData(res, "Payment Request Sent Successfully", response.data)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }


}

export { sendTestPaymentRequest }