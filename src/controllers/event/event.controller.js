import Event from "../../models/event/event.model.js";

import { created, frontError, catchError, validationError, createdWithData, successOk } from "../../utils/responses.js";
import { convertToLowercase, validateEmail, validatePassword } from '../../utils/utils.js';
import { bodyReqFields } from "../../utils/requiredFields.js"
import { Sequelize } from "sequelize";

// ========================= addEvent ===========================

// 
export async function addEvent(req, res) {
    try {
        const reqBodyFields = bodyReqFields(req, res, [
            "category",
            "style",
            "title",
            "description",
            "date",
            "totalTickets",
            "location",
            "city",
            "province",
            "organizer",
            "organizerDetails",
        ]);
        const reqData = convertToLowercase(req.body)
        const {
            category,
            style,
            title,
            description,
            date,
            totalTickets,
            location,
            city,
            province,
            organizer,
            organizerDetails,
        } = reqData;

        if (reqBodyFields.error) return reqBodyFields.resData;

        console.log("=====================");
        console.log("reqData", reqData);
        console.log("=====================");

        const eventData = {
            category,
            style,
            title,
            description,
            date,
            total_tickets: totalTickets,
            location: {
                type: 'Point',
                coordinates: location // Example coordinates (latitude, longitude)
            },
            city,
            province,
            organizer,
            organizer_details: organizerDetails,
        }

        console.log(' ======= eventData ======== ', eventData);


        const eventCreated = await Event.create(eventData)
        console.log(' ======= eventCreated ======== ', eventCreated);

        return created(res, "Event created successfully")
    } catch (error) {
        console.log(error)
        if (error instanceof Sequelize.ValidationError) {
            const errorMessage = error.errors[0].message;
            const key = error.errors[0].path
            validationError(res, key, errorMessage);
        } else {
            catchError(res, error);
        }
    }
}