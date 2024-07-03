// ================================================================
// ===================== success responses ========================
// ================================================================

const successResponse = (res, message, data = null) => {
    const response = {
        success: true,
        message: message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(200).send(response);
};


// ========================== successOk ===========================

const successOk = (res, message) => {
    return res.status(200).send({
        success: true,
        message: message,
    });
};

// ===================== successOkWithData ========================

const successOkWithData = (res, message, data) => {
    return res.status(200).send({
        success: true,
        message: message,
        data: data,
    });
};

// =========================== created ============================

const created = (res, message) => {
    return res.status(201).send({
        success: true,
        message: message,
    });
};

// ======================= createdWithData ========================

const createdWithData = (res, message, data) => {
    return res.status(201).send({
        success: true,
        message: message,
        data: data,
    });
};

// ================================================================
// ======================= error responses ========================
// ================================================================

// ========================= catchError ===========================
const catchError = (res, error) => {
    return res.status(500).send({
        message: error.message || "Internal server error",
    });
};

// ======================== validationError =======================

const validationError = (res, message, field) => {
    return res.status(400).send({
        success: false,
        error: "user",
        field: field,
        message: message,
    });
};

// ========================= frontError ===========================

const frontError = (res, message, field) => {
    return res.status(400).send({
        success: false,
        error: "frontend",
        field: field,
        message: message,
    });
};

// ========================== backError ===========================
// This will be used when we are calling the other external Api's from backend And facing an issue.

const backError = (res, message, field) => {
    return res.status(400).send({
        success: false,
        error: "backend",
        field: field,
        message: message,
    });
};

// ============================ notFound ==========================

const notFound = (res, message) => {
    return res.status(404).send({
        success: false,
        message: message,
    });
};

// ========================= conflictError ========================

const conflictError = (res, message) => {
    return res.status(409).send({
        success: false,
        message: message,
    });
};

// ================================================================

export {
    successResponse,
    successOk,
    successOkWithData,
    created,
    createdWithData,
    catchError,
    validationError,
    frontError,
    backError,
    notFound,
    conflictError
};