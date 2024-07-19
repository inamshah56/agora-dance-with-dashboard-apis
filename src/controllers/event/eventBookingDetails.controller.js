import { Pass } from "../../models/event/pass.model.js";
import { Food } from "../../models/event/food.model.js";
import { Room } from "../../models/event/rooms.model.js";
import { convertToLowercase } from '../../utils/utils.js';
import { Event } from "../../models/event/event.model.js";
import { bodyReqFields } from "../../utils/requiredFields.js"
import { created, frontError, catchError, validationError, createdWithData, successOk, successOkWithData } from "../../utils/responses.js";

// =====================================================================
// ================================ Passes =============================
// =====================================================================

// ============================= addConcertPass ========================

export async function addConcertPass(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "passType",
            "price",
            "date",
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        const reqData = convertToLowercase(req.body, ['eventUuid'])

        const {
            eventUuid, passType, price, date
        } = reqData;

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })

        if (!event) {
            return validationError(res, 'No Event Exist', 'eventUuid');
        }

        if (event.type !== 'concert') return validationError(res, "Only Concert Pass can be added here")

        const pass = await Pass.findOne({
            where: {
                event_uuid: eventUuid
            }
        })

        if (pass) {
            return validationError(res, 'Pass Already Exist');
        }

        const time = req.body.time || event.time

        const passData = {
            pass_type: passType,
            price,
            date,
            time,
            event_uuid: eventUuid
        }

        await Pass.create(passData)

        return created(res, "Concert Pass Created Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= addCongressPass ========================

export async function addCongressPass(req, res) {
    try {

        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "passType",
            "price",
            "date",
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        const reqData = convertToLowercase(req.body, ['eventUuid'])
        const {
            eventUuid, passType, price, date
        } = reqData;

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })

        if (!event) {
            return validationError(res, 'No Event Exist', 'eventUuid');
        }

        if (event.type !== 'congress') return validationError(res, "Only Congress Pass can be added here")

        const passes = await Pass.findAll({
            where: {
                event_uuid: eventUuid
            }
        })

        const passExists = passes.some(pass => pass.pass_type === passType);

        if (passExists) {
            return validationError(res, `${req.body.passType} Already Exist`);
        }

        const time = req.body.time || event.time

        const passData = {
            pass_type: passType,
            price,
            date,
            time,
            event_uuid: eventUuid
        }

        await Pass.create(passData)

        return created(res, "Congress Pass Created Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// =====================================================================
// ================================ Rooms ==============================
// =====================================================================

// ========================= addCongressRooms ===========================

export async function addCongressRooms(req, res) {
    try {

        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "bed",
            "price_per_night",
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        // const reqData = convertToLowercase(req.body, ['eventUuid'])
        // const {
        //     eventUuid, bed, price_per_night
        // } = reqData;
        const {
            eventUuid, bed, price_per_night
        } = req.body;

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })

        if (!event) {
            return validationError(res, 'No Event Exist', 'eventUuid');
        }

        if (event.type !== 'congress') return validationError(res, "Only Congress Rooms can be added here")

        const rooms = await Room.findAll({
            where: {
                event_uuid: eventUuid
            }
        })

        const roomExists = rooms.some(room => room.bed === bed);

        if (roomExists) {
            return validationError(res, `Price for ${req.body.bed} Beds Already Exist`);
        }

        const roomData = {
            bed,
            price_per_night,
            event_uuid: eventUuid
        }

        await Room.create(roomData)

        return created(res, "Congress Rooms Added Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// =====================================================================
// ================================= Food ==============================
// =====================================================================

// ========================= addCongressFood ===========================

export async function addCongressFood(req, res) {
    try {

        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "breakfast_price",
            "allboard_price",
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        // const reqData = convertToLowercase(req.body, ['eventUuid'])
        // const {
        //     eventUuid, breakfast_price, allboard_price
        // } = reqData;
        const {
            eventUuid, breakfast_price, allboard_price
        } = req.body;

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })

        if (!event) {
            return validationError(res, 'No Event Exist', 'eventUuid');
        }

        if (event.type !== 'congress') return validationError(res, "Only Congress Food Prices can be added here")

        const food = await Food.findOne({
            where: {
                event_uuid: eventUuid
            }
        })

        if (food) {
            return validationError(res, 'Food Prices Already Exist');
        }

        const foodData = {
            breakfast_price,
            allboard_price,
            event_uuid: eventUuid
        }

        await Food.create(foodData)

        return created(res, "Congress Food Prices Added Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// patch and delete apis will be created with dashboard

// =====================================================================
// =========================== Events Details ==========================
// =====================================================================

// ======================= getEventBookingDetails ======================

export async function getEventBookingDetails(req, res) {
    try {

        const { eventUuid } = req.query
        if (!eventUuid) return validationError(res, "this is required", "eventUuid")
        console.log("===== eventUuid ===== : ", eventUuid)

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            },
            attributes: ["type"]
        })

        if (!event) {
            return validationError(res, 'No Event Exist', 'eventUuid');
        }

        if (event.type === 'academy' || event.type === 'social') return validationError(res, "Booking is allowed for Concert and Congress Only")

        if (event.type === 'concert') {
            const passData = await Pass.findOne({
                where: {
                    event_uuid: eventUuid
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'event_uuid']
                }
            })

            console.log("passData ====== \n", passData)
            return successOkWithData(res, "Data Fetched", { passData })
        }
        // else
        const passesData = await Pass.findAll({
            where: {
                event_uuid: eventUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }

        })
        const roomsData = await Room.findAll({
            where: {
                event_uuid: eventUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })
        const foodData = await Food.findOne({
            where: {
                event_uuid: eventUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })

        console.log("passData ====== \n", passesData)
        console.log("roomData ====== \n", roomsData)
        console.log("foodData ====== \n", foodData)

        return successOkWithData(res, "Data Fetched", { passesData, roomsData, foodData })
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}
// =====================================================================