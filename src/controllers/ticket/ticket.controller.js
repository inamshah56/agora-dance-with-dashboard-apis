import { Pass } from "../../models/event/pass.model.js";
import { Food } from "../../models/event/food.model.js";
import { Room } from "../../models/event/rooms.model.js";
import { convertToLowercase } from '../../utils/utils.js';
import { Event } from "../../models/event/event.model.js";
import { bodyReqFields } from "../../utils/requiredFields.js"
import { created, frontError, catchError, validationError, createdWithData, successOk, successOkWithData } from "../../utils/responses.js";
import { Op } from "sequelize";
import { Json } from "sequelize/lib/utils";

// =====================================================================
// =============================== Tickets =============================
// =====================================================================

// =============================== bookCongressTicket ==========================

export async function bookCongressTicket(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "passUuid",
            "roomUuidsArray",
            "noOfPersons",
            "noOfNights",
            "noOfRooms",
            "food",
            "totalAmount",
            "personsInfoArray",
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        const {
            eventUuid,
            passUuid,
            roomUuidsArray,
            noOfPersons,
            noOfNights,
            noOfRooms,
            foodType,
            totalAmount,
            personsInfoArray,
        } = req.body;

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })

        if (!event) {
            return frontError(res, 'Invalid eventUuid', 'eventUuid');
        }


        if (event.type !== 'congress') return frontError(res, "Only Congress Tickets can be Booked here")

        if (foodType !== 'breakfast' || foodType !== 'fullboard') {
            return frontError(res, 'foodType must be either breakfast or fullboard', 'foodType');
        }

        const pass = await Pass.findOne({
            where: {
                pass_uuid: passUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })

        if (!pass) {
            return frontError(res, 'Invalid passUuid', 'passUuid');
        }

        let room = await Room.findAll({
            where: {
                room_uuid: {
                    [Op.in]: roomUuidsArray,
                }
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })

        if (!room || (Array.isArray(room) && room.length === 0)) {
            return frontError(res, 'Invalid roomUuidsArray. No Room Found for roomUuidArray.', 'roomUuidsArray');
        }

        room = JSON.parse(JSON.stringify(room))
        console.log('room =============== ', room)

        if (room.length !== roomUuidsArray.length) return frontError(res, "Invalid roomUuidsArray. Contain roomUuid that doesn't Exist.")

        if (personsInfoArray.length === 0) return frontError(res, "Atleast one person info required.")

        if (personsInfoArray.length !== noOfPersons) return frontError(res, "Incomplete Person Info. No of Person > personsInfoArray")

        // CALCULATING TICKET AMOUNT   
        let roomAmount = 0;
        for (bed in room) {
            roomAmount += bed.price_per_night * noOfNights
        }

        // pending code here




        // const ticketData = {
        //     date,
        //     pass_type: passType,
        //     price,
        //     time,
        //     event_uuid: eventUuid
        // }

        // console.log('ticketData =============== ', ticketData)


        // await Pass.create(passData)

        // return created(res, "Concert Pass Created Successfully")
        return successOk(res, "Ticket Booked Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= addCongressPass ========================

// export async function addCongressPass(req, res) {
//     try {

//         const reqBodyFields = bodyReqFields(req, res, [
//             "eventUuid",
//             "passType",
//             "price",
//             "date",
//         ]);

//         if (reqBodyFields.error) return reqBodyFields.resData;

//         const reqData = convertToLowercase(req.body, ['eventUuid'])
//         const {
//             eventUuid, passType, price, date
//         } = reqData;

//         const event = await Event.findOne({
//             where: {
//                 uuid: eventUuid
//             }
//         })

//         if (!event) {
//             return validationError(res, 'No Event Exist', 'eventUuid');
//         }

//         if (event.type !== 'congress') return validationError(res, "Only Congress Pass can be added here")

//         const passes = await Pass.findAll({
//             where: {
//                 event_uuid: eventUuid
//             }
//         })

//         const passExists = passes.some(pass => pass.pass_type === passType);

//         if (passExists) {
//             return validationError(res, `${req.body.passType} Already Exist`);
//         }

//         const time = req.body.time || event.time

//         const passData = {
//             pass_type: passType,
//             price,
//             date,
//             time,
//             event_uuid: eventUuid
//         }

//         await Pass.create(passData)

//         return created(res, "Congress Pass Created Successfully")
//     } catch (error) {
//         console.log(error)
//         catchError(res, error);
//     }
// }

// =====================================================================
// ================================ Rooms ==============================
// =====================================================================

// ========================= addCongressRooms ===========================

// export async function addCongressRooms(req, res) {
//     try {

//         const reqBodyFields = bodyReqFields(req, res, [
//             "eventUuid",
//             "bed",
//             "price_per_night",
//         ]);

//         if (reqBodyFields.error) return reqBodyFields.resData;

//         // const reqData = convertToLowercase(req.body, ['eventUuid'])
//         // const {
//         //     eventUuid, bed, price_per_night
//         // } = reqData;
//         const {
//             eventUuid, bed, price_per_night
//         } = req.body;

//         const event = await Event.findOne({
//             where: {
//                 uuid: eventUuid
//             }
//         })

//         if (!event) {
//             return validationError(res, 'No Event Exist', 'eventUuid');
//         }

//         if (event.type !== 'congress') return validationError(res, "Only Congress Rooms can be added here")

//         const rooms = await Room.findAll({
//             where: {
//                 event_uuid: eventUuid
//             }
//         })

//         const roomExists = rooms.some(room => room.bed === bed);

//         if (roomExists) {
//             return validationError(res, `Price for ${req.body.bed} Beds Already Exist`);
//         }

//         const roomData = {
//             bed,
//             price_per_night,
//             event_uuid: eventUuid
//         }

//         await Room.create(roomData)

//         return created(res, "Congress Rooms Added Successfully")
//     } catch (error) {
//         console.log(error)
//         catchError(res, error);
//     }
// }

// // =====================================================================
// // ================================= Food ==============================
// // =====================================================================

// // ========================= addCongressFood ===========================

// export async function addCongressFood(req, res) {
//     try {

//         const reqBodyFields = bodyReqFields(req, res, [
//             "eventUuid",
//             "breakfast_price",
//             "allboard_price",
//         ]);

//         if (reqBodyFields.error) return reqBodyFields.resData;

//         // const reqData = convertToLowercase(req.body, ['eventUuid'])
//         // const {
//         //     eventUuid, breakfast_price, allboard_price
//         // } = reqData;
//         const {
//             eventUuid, breakfast_price, allboard_price
//         } = req.body;

//         const event = await Event.findOne({
//             where: {
//                 uuid: eventUuid
//             }
//         })

//         if (!event) {
//             return validationError(res, 'No Event Exist', 'eventUuid');
//         }

//         if (event.type !== 'congress') return validationError(res, "Only Congress Food Prices can be added here")

//         const food = await Food.findOne({
//             where: {
//                 event_uuid: eventUuid
//             }
//         })

//         if (food) {
//             return validationError(res, 'Food Prices Already Exist');
//         }

//         const foodData = {
//             breakfast_price,
//             allboard_price,
//             event_uuid: eventUuid
//         }

//         await Food.create(foodData)

//         return created(res, "Congress Food Prices Added Successfully")
//     } catch (error) {
//         console.log(error)
//         catchError(res, error);
//     }
// }

// patch and delete apis will be created with dashboard
// =====================================================================