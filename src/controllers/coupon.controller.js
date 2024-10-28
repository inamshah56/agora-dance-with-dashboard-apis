import Sequelize from "sequelize";
import Coupon from "../models/coupon.model.js";
import { bodyReqFields } from "../utils/requiredFields.js"
import { created, frontError, catchError, validationError, createdWithData, successOk, successOkWithData, notFound, sequelizeValidationError, conflictError } from "../utils/responses.js";


// ==============================================================
//                           Controllers
// ==============================================================


export async function createCoupon(req, res) {
    try {
        const reqFields = ["code", "discount_percent", "expiry"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields)
        if (bodyFieldsReq.error) return bodyFieldsReq.response

        const { code, discount_percent, expiry } = req.body;
        const newCoupon = await Coupon.create({ code, discount_percent, expiry });
        return createdWithData(res, newCoupon);
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) return sequelizeValidationError(res, error);
        if (error.name === Sequelize.UniqueConstraintError) return conflictError(res, "Coupon code already exists.");
        return catchError(res, error);
    }
}

// ======================== getAllCoupons =============================

export async function getAllCoupons(req, res) {
    try {
        const coupons = await Coupon.findAll();
        return successOkWithData(res, coupons);
    } catch (error) {
        return catchError(res, error);
    }
}

// ======================== verifyCoupon =============================

export async function verifyCoupon(req, res) {
    try {
        const { code } = req.body;
        if (!code) return validationError(res, "Coupon code is required.");
        const coupon = await Coupon.findOne({ where: { code }, attributes: ["code", "discount_percent", "expiry"] });
        if (!coupon) return validationError(res, "Invalid coupon code.");
        if (coupon.expiry < new Date()) return frontError(res, "Coupon has expired.");
        return successOkWithData(res, "Coupon is valid.", coupon);
    } catch (error) {
        return catchError(res, error);
    }
}

