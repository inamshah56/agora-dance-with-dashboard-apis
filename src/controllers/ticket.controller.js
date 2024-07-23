import { Op } from "sequelize";
import { bodyReqFields } from "../utils/requiredFields.js"
import { Person, Ticket } from "../models/ticket.model.js";
import { Event, Pass, Room, Food } from "../models/event.model.js";
import { frontError, catchError, validationError, successOk, successOkWithData } from "../utils/responses.js";

// =====================================================================
//                                Tickets
// =====================================================================

// ============================ getAllTickets ==========================
export async function getAllTickets(req, res) {
    try {
        console.log(req.user)
        const ticket = await Ticket.findAll({
            where: {
                user_uuid: req.user
            },
            attributes: {
                exclude: ['date', 'no_of_rooms', 'beds', 'food', 'paid', 'createdAt', 'updatedAt', 'event_uuid', 'user_uuid', 'pass_uuid']
            },
            include: [
                {
                    model: Event,
                    as: 'event',
                    attributes: ['type', 'title', 'location']
                },
                {
                    model: Pass,
                    as: 'pass',
                    attributes: ['pass_type', 'date', 'time']
                },
                {
                    model: Person,
                    as: 'ticket_person',
                    attributes: ['fname', 'lname']
                }
            ]
        });

        return successOkWithData(res, "Tickets Fetched Successfully", ticket)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}


// ========================== bookConcertTicket ========================

export async function bookConcertTicket(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "passUuid",
            "noOfPersons",
            "totalAmount",
            "personsInfoArray",
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        const {
            eventUuid,
            passUuid,
            noOfPersons,
            totalAmount,
            personsInfoArray,
        } = req.body;

        if (personsInfoArray.length === 0) return frontError(res, "Atleast one person info required.")

        if (personsInfoArray.length !== noOfPersons) return frontError(res, "Incomplete Person Info. No of Person > personsInfoArray")

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })
        if (!event) {
            return frontError(res, 'Invalid eventUuid', 'eventUuid');
        }

        if (event.type !== 'concert' && event.type !== 'congress') return frontError(res, "Only Concert and Congress Tickets (other than full pass) can be Booked here")

        // check tickets availability 
        const ticketCount = await Ticket.count({
            where: {
                event_uuid: eventUuid
            }
        });
        const availableTickets = event.total_tickets - ticketCount
        console.log(availableTickets);
        if (availableTickets === 0) return successOk(res, "Booking Closed. No Tickets Available")

        const pass = await Pass.findOne({
            where: {
                uuid: passUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })
        if (!pass) {
            return frontError(res, 'Invalid passUuid', 'passUuid');
        }

        if (event.type === 'congress' && pass.pass_type === 'full pass') return frontError(res, "Full Pass for Congress cannot be Booked here. (Use ticket/congress api)", "passUuid")


        // CALCULATING TICKET AMOUNT 
        let totalAmountCalculated = pass.price * noOfPersons

        if (totalAmountCalculated !== totalAmount) {
            return frontError(res, "Conflict in Total Amount Calculation", "totalAmount")
        }

        const ticketData = {
            date: Date.now(),
            no_of_person: noOfPersons,
            total_amount: totalAmount,
            paid: false,
            user_uuid: req.user,
            event_uuid: eventUuid,
            pass_uuid: passUuid
        }

        const ticketCreated = await Ticket.create(ticketData)

        const ticketUuid = ticketCreated.uuid

        // Map ticket_uuid to each object in personsInfoArray
        const personsWithTicketUuid = personsInfoArray.map(person => ({
            ...person,
            ticket_uuid: ticketUuid
        }));

        await Person.bulkCreate(personsWithTicketUuid)

        return successOk(res, "Ticket Booked Successfully")
    } catch (error) {
        console.log(error)
        if (error.name === 'SequelizeDatabaseError') {
            const databaseErrorMessage = error.original.detail;
            const columnName = error.original.column;
            const errorMessage = `${databaseErrorMessage}`;
            frontError(res, errorMessage, columnName);
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            const constraintName = error.original.constraint;
            const errorMessage = `invalid token or token expired`;
            frontError(res, errorMessage, constraintName);
        } else {
            catchError(res, error);
        }
    }
}

// ========================== bookCongressTicket ========================

export async function bookCongressTicket(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "passUuid",
            "roomUuidsArray",
            "noOfPersons",
            "noOfNights",
            "noOfRooms",
            "foodType",
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

        if (personsInfoArray.length === 0) return frontError(res, "Atleast one person info required.")

        if (personsInfoArray.length !== noOfPersons) return frontError(res, "Incomplete Person Info. No of Person > personsInfoArray")

        const event = await Event.findOne({
            where: {
                uuid: eventUuid
            }
        })
        if (!event) {
            return frontError(res, 'Invalid eventUuid', 'eventUuid');
        }

        // console.log('event =============== ', event)
        // console.log(' =============================================== ')

        if (event.type !== 'congress') return frontError(res, "Only Congress Tickets can be Booked here")

        // check tickets availability 
        const ticketCount = await Ticket.count({
            where: {
                event_uuid: eventUuid
            }
        });
        const availableTickets = event.total_tickets - ticketCount
        if (availableTickets === 0) return successOk(res, "Booking Closed. No Tickets Available")

        if (foodType !== 'breakfast' && foodType !== 'fullboard') {
            return frontError(res, 'foodType must be either breakfast or fullboard', 'foodType');
        }

        const pass = await Pass.findOne({
            where: {
                uuid: passUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })
        if (!pass) {
            return frontError(res, 'Invalid passUuid', 'passUuid');
        }

        if (pass.pass_type !== 'full pass') return frontError(res, "Only Full Pass for Congress can be Booked here")

        if (noOfRooms !== roomUuidsArray.length) return frontError(res, "noOfRooms doesn't match the info in roomUuidArray")

        let room = await Room.findAll({
            where: {
                uuid: {
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
        // console.log('room =============== ', room)
        // console.log(' =============================================== ')

        if (room.length !== roomUuidsArray.length) return frontError(res, "Invalid roomUuidsArray. Contain roomUuid that doesn't Exist.")

        const food = await Food.findOne({
            where: {
                event_uuid: eventUuid
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'event_uuid']
            }
        })
        if (!food) {
            return validationError(res, 'Food Prices Were Not Added'); // modify msg
        }

        // console.log('food =============== ', food)
        // console.log(' =============================================== ')

        // CALCULATING TICKET AMOUNT 

        let roomAmount = 0;
        for (const bed in room) {
            console.log('room[bed].price_per_night =============== ', room[bed].price_per_night)
            roomAmount += room[bed].price_per_night * noOfNights
        }

        // console.log('roomAmount =============== ', roomAmount)
        // console.log(' =============================================== ')

        let foodAmount = 0
        if (foodType === 'breakfast') {
            foodAmount = food.breakfast_price * noOfPersons
        } else {
            foodAmount = food.allboard_price * noOfPersons
        }

        // console.log('foodAmount =============== ', foodAmount)
        // console.log(' =============================================== ')

        // const passType = pass.pass_type
        let passAmount = pass.price * noOfPersons

        // console.log('passAmount =============== ', passAmount)
        // console.log(' =============================================== ')

        const totalAmountCalculated = roomAmount + foodAmount + passAmount

        // console.log('totalAmountCalculated =============== ', totalAmountCalculated)
        // console.log(' =============================================== ')

        if (totalAmountCalculated !== totalAmount) {
            return frontError(res, "Conflict in Total Amount Calculation", "totalAmount")
        }

        let bedString = ''
        for (const bed in room) {
            bedString += room[bed].bed + ', '
        }

        bedString = bedString.slice(0, -2)

        // console.log('bedString =============== ', bedString)
        // console.log(' =============================================== ')

        const ticketData = {
            date: Date.now(),
            no_of_nights: noOfNights,
            no_of_rooms: noOfRooms,
            no_of_person: noOfPersons,
            beds: bedString,
            food: foodType,
            total_amount: totalAmount,
            paid: false,
            user_uuid: req.user,
            event_uuid: eventUuid,
            pass_uuid: passUuid
        }

        // console.log('ticketData =============== ', ticketData)
        // console.log(' =============================================== ')

        const ticketCreated = await Ticket.create(ticketData)

        // console.log('ticketCreated =============== ', ticketCreated)
        // console.log(' =============================================== ')

        // console.log('personsInfoArray =============== ', personsInfoArray)
        // console.log(' =============================================== ')

        const ticketUuid = ticketCreated.uuid

        // Map ticket_uuid to each object in personsInfoArray
        const personsWithTicketUuid = personsInfoArray.map(person => ({
            ...person,
            ticket_uuid: ticketUuid
        }));

        // console.log('personsWithTicketUuid =============== ', personsWithTicketUuid)
        // console.log(' =============================================== ')

        const personsCreated = await Person.bulkCreate(personsWithTicketUuid)

        // console.log('personsCreated =============== ', personsCreated)
        // console.log(' =============================================== ')

        return successOk(res, "Ticket Booked Successfully")
    } catch (error) {
        console.log(error)
        if (error.name === 'SequelizeDatabaseError') {
            const databaseErrorMessage = error.original.detail;
            const columnName = error.original.column;
            const errorMessage = `${databaseErrorMessage})`;
            frontError(res, errorMessage, columnName);
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            const constraintName = error.original.constraint;
            const errorMessage = `invalid token or token expired`;
            frontError(res, errorMessage, constraintName);
        } else {
            catchError(res, error);
        }
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