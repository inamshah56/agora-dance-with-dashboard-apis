import { catchError, successOk, frontError } from "../utils/responses.js"
import { createRedsysAPI, randomTransactionId, isResponseCodeOk, SANDBOX_URLS, PRODUCTION_URLS, TRANSACTION_TYPES } from "redsys-easy";
import { Ticket } from "../models/ticket.model.js";
import { getRedsysConfig } from "../config/redsysPayment.config.js";
const { urls, secretKey, DS_MERCHANT_MERCHANTCODE, DS_MERCHANT_TERMINAL, DS_MERCHANT_URLOK, DS_MERCHANT_URLKO, DS_MERCHANT_MERCHANTURL, DS_MERCHANT_MERCHANTNAME } = getRedsysConfig();

const { createRedirectForm, processRestNotification, } = createRedsysAPI({
    urls: urls,
    secretKey: secretKey
});


// ====================================================================
//                           CONTROLLERS
// ====================================================================

// ========================= RedsysPaymentTest ===========================
const redsysPaymentTest = async (req, res) => {
    try {
        const orderId = randomTransactionId();
        // const orderId = 'test_p8SVAlQ';
        const testOrderId = "test_" + orderId.slice(5,);
        const htmlForm = createPaymentForm(testOrderId, 5000);
        return res.status(200).send(htmlForm);
    } catch (error) {
        console.log("============== error in payment initiation request ==============:\n ", error);
        return catchError(res, error);
    }
}

// ========================= RedsysPayment ===========================
const redsysPayment = async (req, res) => {
    const { ticketUid } = req.query;
    if (!ticketUid) {
        return frontError(res, "Ticket UID is required", "ticketUid");
    }
    try {
        const ticket = await Ticket.findOne(
            {
                where: { uuid: ticketUid },
                attributes: ['uuid', 'total_amount', 'order_id', 'paid']
            });
        if (!ticket) {
            const responseHtml = getPaymentErrorHtml("Ticket not found", "frontend");
            return res.status(200).send(responseHtml);
        }
        if (ticket.paid) {
            const responseHtml = getPaymentErrorHtml("Ticket already paid", "user");
            return res.status(200).send(responseHtml);
        }

        // IF NOT PAID BUT ORDER ID EXISTS
        if (ticket.order_id) {
            // INQUIRY STATUS OF THE TRANSACTION WITH THIS ORDER_ID
            const responseHtml = createPaymentForm(ticket.order_id, ticket.total_amount);
            return res.status(200).send(responseHtml);
        }

        // ELSE CREATE NEW PAYMENT REQUEST WITH NEW ORDER ID
        const orderId = randomTransactionId();
        ticket.order_id = orderId;
        await ticket.save();

        const responseHtml = createPaymentForm(orderId, ticket.total_amount);
        return res.status(200).send(responseHtml);
    } catch (error) {
        console.log("============== error in payment initiation request ==============:\n ", error);
        const responseHtml = getPaymentErrorHtml("Soemthing went wrong, please try later", "backend");
        return res.status(200).send(responseHtml);
    }
}


// ========================= RedsysPaymentSuccess ===========================

const redsysPaymentSuccess = async (req, res) => {
    try {

        const { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature } = req.query;
        const paymentData = { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature };
        const response = processRestNotification(paymentData);
        const { Ds_Response, Ds_Order, Ds_AuthorisationCode } = response;

        const isTestRequest = Ds_Order.split('_')[0] === 'test'
        if (isTestRequest) console.log("================ response Error: \n", response);
        // IF NOT TEST REQUEST THAN PROCESS THE TICKET
        else {
            if (!isResponseCodeOk(Ds_Response)) {
                const responseHtml = getPaymentErrorHtml(null, null, Ds_Response);
                return res.status(200).send(responseHtml);
            }
            const ticket = await Ticket.findOne({
                where: { order_id: Ds_Order },
                attributes: ["uid", "paid", "order_id"]
            });
            if (ticket && !ticket.paid) {
                ticket.paid = true;
                ticket.paid_order_id = Ds_Order;
                ticket.payment_date = new Date();
                ticket.authorization_code = Ds_AuthorisationCode;
                ticket.order_id = null;
                ticket.save();
            }
        }
        const responseHtml = getPaymentSuccessHtml(Ds_Order);
        return res.status(200).send(responseHtml);
    }
    catch (error) {
        console.log("================ error in error request: ", error);
        const responseHtml = getPaymentErrorHtml("Something went wrong, please try again", "backend");
        return res.status(200).send(responseHtml);
    }
}

// ========================= RedsysPaymentError ===========================

const redsysPaymentError = async (req, res) => {
    try {
        const { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature } = req.query;
        const paymentData = { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature };
        const response = processRestNotification(paymentData);
        const { Ds_Response, Ds_Order, Ds_Date, Ds_Hour } = response;

        const isTestRequest = Ds_Order.split('_')[0] === 'test'
        if (isTestRequest) console.log("================ response Error: \n", response);
        // IF NOT TEST REQUEST THAN PROCESS THE TICKET
        else {
            const ticket = await Ticket.findOne({
                where: { order_id: Ds_Order },
                attributes: ["uid", "paid", "order_id"]
            })
            // IF PAYMENT ALREADY DONE ON THIS ORDER_ID
            if (Ds_Response === '9051') {
                ticket.order_id = null;
                ticket.paid_order_id = Ds_Order;
                ticket.paid = true;
                ticket.payment_date = new Date(`${Ds_Date}T${Ds_Hour}`);
                ticket.save();
            }
            // IF PAYMENT FAILED
            ticket.order_id = null;
            ticket.save();
        }
        const htmlResponse = getPaymentErrorHtml(null, null, Ds_Response);
        return res.status(200).send(htmlResponse);
    }
    catch (error) {
        console.log("================ error in error request: ", error);
        const responseHtml = getPaymentErrorHtml("Something went wrong, please try again", "backend");
        return res.status(200).send(responseHtml);
    }
}


// / ========================= RedsysPayment Notification ===========================
const redsysPaymentNotification = async (req, res) => {
    console.log("============= Redsys payment notification =======================");
    try {
        const notification = processRestNotification(req.body);
        const { Ds_Order, Ds_Response, Ds_AuthorisationCode } = notification;
        if (isResponseCodeOk(Ds_Response)) {
            const ticket = await Ticket.findOne({
                where: { order_id: Ds_Order },
                attributes: ["uid", "paid", "order_id"]
            });
            if (ticket && !ticket.paid) {
                ticket.paid = true;
                ticket.paid_order_id = Ds_Order;
                ticket.payment_date = new Date();
                ticket.authorization_code = Ds_AuthorisationCode;
                ticket.order_id = null;
                ticket.save();
            };
        }
        return successOk(res, "Payment successful");
    }
    catch (error) {
        console.log("================ error Notification: \n", error);
        return catchError(res, error);
    }

}
export { redsysPayment, redsysPaymentNotification, redsysPaymentSuccess, redsysPaymentError, redsysPaymentTest };

// ====================================================================
//                           PAYMENT FUNCTIONS
// ====================================================================

// ========================= createPaymentForm ===========================
const createPaymentForm = (orderId, amount) => {
    const amountInCents = amount * 100;
    const form = createRedirectForm({
        DS_MERCHANT_MERCHANTCODE,
        DS_MERCHANT_TERMINAL,
        DS_MERCHANT_TRANSACTIONTYPE: TRANSACTION_TYPES.AUTHORIZATION, // '0'
        DS_MERCHANT_ORDER: orderId,
        // amount in smallest currency unit(cents)
        DS_MERCHANT_AMOUNT: amountInCents,
        DS_MERCHANT_CURRENCY: '978',
        DS_MERCHANT_MERCHANTNAME,
        DS_MERCHANT_MERCHANTURL,
        DS_MERCHANT_URLOK,
        DS_MERCHANT_URLKO,
    });
    console.log("================ form: ", form);
    console.log("================ order_id: ", orderId);
    const htmlForm = `
    <!DOCTYPE html>
    <html>
    <head><script src="/static/js/autoSubmit.js"></script></head>
    <body>
        <h1>Payment for order ${orderId}</h1>
        <form id="autoSubmitForm" action="${form.url}" method="post">
        <input type="hidden" id="Ds_SignatureVersion" name="Ds_SignatureVersion" value="${form.body.Ds_SignatureVersion}" />
        <input type="hidden" id="Ds_MerchantParameters" name="Ds_MerchantParameters" value="${form.body.Ds_MerchantParameters}" />
        <input type="hidden" id="Ds_Signature" name="Ds_Signature" value="${form.body.Ds_Signature}"/>
        </form>
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                document.getElementById("autoSubmitForm").submit();
            });
        </script>
    </body>
    </html>
    `;
    return htmlForm;
};


// ========================= getPaymentSuccessHtml ===========================
const getPaymentSuccessHtml = (orderId) => {
    const responseHtml = `
    <!DOCTYPE html>
    <html>
    <body>
        <h1 style="text-align: center;">Ticket booked successfully with orderId: ${orderId}</h1>
        <script>
            var response = {
                success: true,
                message: "Ticket booked successfully!",
                data: {order_id: "${orderId}"}
            };

            // Sending JSON response to React Native WebView
            window.onload = function() {
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

// ========================= getPaymentErrorHtml ===========================
const getPaymentErrorHtml = (errorMessage, error, errorCode) => {
    const userError = ['0101', '0102', '0106', '0125', '0129', '0184', '173', '174', '0190', '0191', '0195', '0202', '0912', '9912', '9064', '9093', '9253', '9915', '9997', '9051']
    const redsysErrors = {
        "0101": "Expired card",
        "0102": "Card in temporary exception or under suspicion of fraud",
        "0106": "PIN attempts exceeded",
        "0125": "Card not effective",
        "0129": "Incorrect security code (CVV2/CVC2)",
        "0184": "Error in the authentication of the holder",
        "174": "Denied, do not repeat before 72 hours",
        "0190": "Refusal by the card issuer without specifying reason, payment cannot be done now",
        "0191": "Wrong expiration date",
        "0195": "Requires SCA (Strong Customer Authentication) authentication",
        "0202": "Card in temporary exception or under suspicion of fraud with card withdrawal",
        "0912": "Issuer not available",
        "9912": "Issuer not available",
        "9064": "Incorrect number of card positions",
        "9093": "Card does not exist",
        "9253": "Card does not comply with the check-digit",
        "9915": "The payment has been cancelled on your request",
        "9997": "Another transaction is being processed in SIS with the same card",
        "9051": "Payment already done for this ticket",
        "173": "Denied, do not repeat without updating card details.",
        "172": "The payment is denied from the gateway, please try again later."
    }
    if (errorCode) {
        if (userError.includes(errorCode)) {
            errorMessage = redsysErrors[errorCode];
            error = "user";
        }
        else {
            errorMessage = "Something went wrong, please try again";
            error = "backend";
        }
    }
    const responseHtml = `
    <!DOCTYPE html>
    <html>
    <body>
        <h1 style="text-align: center;">${errorMessage}</h1>
        <script>
            var response = {
                success: false,
                message: "${errorMessage}",
                error: "${error}"
            };

            // Sending JSON response to React Native WebView
            window.onload = function() {
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