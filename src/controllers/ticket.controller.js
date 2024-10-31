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
        const ticket = await Ticket.findAll({
            where: {
                user_uuid: req.user
            },
            attributes: {
                exclude: ['date', 'no_of_rooms', 'beds', 'food', 'createdAt', 'updatedAt', 'event_uuid', 'user_uuid', 'pass_uuid']
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
        return catchError(res, error);
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
            return frontError(res, `Conflict in Total Amount Calculation. (totalAmount should be ${totalAmountCalculated})`, "totalAmount")
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

        return successOkWithData(res, "Ticket Booked Successfully", { ticketUuid: ticketUuid })
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
            return catchError(res, error);
        }
    }
}

// ========================== bookCongressTicket ========================

export async function bookCongressTicket(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, [
            "eventUuid",
            "passUuid",
            "noOfPersons",
            // "roomUuidsArray",
            // "noOfRooms",
            // "noOfNights",
            // "foodType",
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

        if (event.type !== 'congress') return frontError(res, "Only Congress Tickets can be Booked here")

        // check tickets availability 
        const ticketCount = await Ticket.count({
            where: {
                event_uuid: eventUuid
            }
        });
        const availableTickets = event.total_tickets - ticketCount
        if (availableTickets === 0) return successOk(res, "Booking Closed. No Tickets Available")

        if (foodType && foodType !== 'breakfast' && foodType !== 'fullboard') {
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

        let roomInfo = null;
        let foodInfo = null;
        // IF ROOMES ARE BOOKED
        if (noOfRooms && roomUuidsArray) {
            if (noOfRooms !== roomUuidsArray.length) return frontError(res, "noOfRooms doesn't match the info in roomUuidArray")
            if (!noOfNights) return validationError(res, "noOfNights is required if rooms to book room.", "noOfNights")
            if (noOfNights < 1) return validationError(res, "noOfNights should be greater than 0", "noOfNights")
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
            roomInfo = [];
            for (const uuid of roomUuidsArray) {
                for (const roomObj of room) {
                    if (uuid === roomObj.uuid) {
                        roomInfo.push(roomObj)
                        break
                    }
                }
            }
        }

        // IF FOOD IS BOOKED
        if (foodType) {
            const food = await Food.findOne({
                where: {
                    event_uuid: eventUuid
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'event_uuid']
                }
            })
            if (!food) {
                return frontError(res, 'Invalid food data.'); // modify msg
            }
            foodInfo = JSON.parse(JSON.stringify(food))
        }

        // CALCULATING TICKET AMOUNT 
        // IF ROOMES ARE BOOKED
        let roomAmount = 0;
        if (roomInfo) {
            for (const bed in roomInfo) {
                roomAmount += roomInfo[bed].price_per_night * noOfNights
            }
        }

        // IF FOOD IS BOOKED
        let foodAmount = 0
        if (foodInfo) {
            if (foodType === 'breakfast') {
                foodAmount = foodInfo.breakfast_price * noOfPersons
            } else {
                foodAmount = foodInfo.allboard_price * noOfPersons
            }
        }
        // const passType = pass.pass_type
        let passAmount = pass.price * noOfPersons

        const totalAmountCalculated = roomAmount + foodAmount + passAmount

        if (totalAmountCalculated !== totalAmount) {
            return frontError(res, `Conflict in Total Amount Calculation. (totalAmount should be ${totalAmountCalculated})`, "totalAmount")
        }

        let bedString = ''
        if (roomInfo) {
            for (const bed in roomInfo) {
                bedString += roomInfo[bed].bed + ', '
            }
            bedString = bedString.slice(0, -2)
        }


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

        const ticketCreated = await Ticket.create(ticketData)

        const ticketUuid = ticketCreated.uuid

        // Map ticket_uuid to each object in personsInfoArray
        const personsWithTicketUuid = personsInfoArray.map(person => ({
            ...person,
            ticket_uuid: ticketUuid
        }));

        await Person.bulkCreate(personsWithTicketUuid)

        return successOkWithData(res, "Ticket Booked Successfully", { ticketUuid: ticketUuid })
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
            return catchError(res, error);
        }
    }
}