import { Event } from "../../models/event/event.model.js";
import { EventImages } from "../../models/event/eventImages.js";

import { created, frontError, catchError, validationError, createdWithData, successOk, successOkWithData } from "../../utils/responses.js";
import { convertToLowercase, validateEmail, validatePassword } from '../../utils/utils.js';
import { bodyReqFields } from "../../utils/requiredFields.js"
import { Sequelize, Op } from "sequelize";

// ========================= addEvent ===========================

// 
export async function addEvent(req, res) {
    try {

        console.log("req.body", req.body);
        console.log("req.files", req.files);
        const reqBodyFields = bodyReqFields(req, res, [
            "type",
            "style",
            "title",
            "description",
            "date",
            "totalTickets",
            "lat",
            "lon",
            "city",
            "province",
            "organizer",
            "organizerDetails"
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        const reqData = convertToLowercase(req.body)
        const {
            type,
            style,
            title,
            description,
            date,
            totalTickets,
            lat,
            lon,
            city,
            province,
            organizer,
            organizerDetails
        } = reqData;


        // Check if at least one image is uploaded
        if (!req.files || !req.files.images || req.files.images.length === 0) {
            return frontError(res, 'At least one image is required')
        }

        console.log("=====================");
        console.log("reqData", reqData);
        console.log("=====================");

        const eventData = {
            type,
            style,
            title,
            description,
            date,
            total_tickets: totalTickets,
            location: {
                type: 'Point',
                coordinates: [lat, lon]
            },
            city,
            province,
            organizer,
            organizer_details: organizerDetails
        }

        console.log(' ======= eventData ======== ', eventData);

        const eventCreated = await Event.create(eventData)
        console.log(' ======= eventCreated ======== ', eventCreated);

        // Process images if available
        if (req.files && req.files["images"]) {
            const imagePaths = req.files["images"].map(file => file.path);

            const imageObjects = imagePaths.map(imagePath => ({
                event_uuid: eventCreated.uuid,
                imageUrl: imagePath
            }));

            console.log(' ======= imageObjects ======== ', imageObjects);

            const imagesAdded = await EventImages.bulkCreate(imageObjects);
            console.log(' ======= imagesAdded ======== ', imagesAdded);

        }

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

// ========================= getEvent ===========================

export async function getEvent(req, res) {
    try {
        console.log('==== this is getEvent ====')
        const { uuid } = req.query
        if (!uuid) return frontError(res, 'this is required', 'uuid')
        const event = await Event.findOne({ where: { uuid } });
        if (!event) {
            return frontError(res, 'invalid uuid', 'uuid');
        }
        console.log('event ===================== :\n', event.dataValues)
        // use this to send coordinates only on location
        // event.location = event.location.coordinates
        return successOkWithData(res, "Event Fetched Successfully", event.dataValues)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= updateEvent ===========================

export async function updateEvent(req, res) {
    try {
        console.log('==== this is updateEvent ====')
        console.log("req.body", req.body);
        console.log("req.files", req.files);
        const { uuid } = req.query
        if (!uuid) return frontError(res, 'this is required', 'uuid')

        // Check if the event exists before updating
        const event = await Event.findOne({ where: { uuid } });

        if (!event) {
            return frontError(res, 'Invalid UUID', 'uuid');
        }

        const reqData = convertToLowercase(req.body)
        const {
            type,
            style,
            title,
            description,
            date,
            totalTickets,
            lat,
            lon,
            city,
            province,
            organizer,
            organizerDetails
        } = reqData;

        console.log("=====================");
        console.log("reqData", reqData);
        console.log("=====================");

        const eventData = {
            type,
            style,
            title,
            description,
            date,
            total_tickets: totalTickets,
            location: {
                type: 'Point',
                coordinates: [lat, lon]
            },
            city,
            province,
            organizer,
            organizer_details: organizerDetails
        }
        const [rowsUpdated] = await Event.update(eventData, { where: { uuid } });
        if (rowsUpdated === 0) {
            return frontError(res, 'Failed to update event');
        }

        // Handle image updates if provided
        if (req.files && req.files['images'] && req.files['images'].length > 0) {
            const images = req.files['images'];

            // Delete existing images associated with the event
            await EventImages.destroy({ where: { event_uuid: event.uuid } });

            // Map the uploaded images to EventImages model format
            const imageObjects = images.map(image => ({
                event_uuid: event.uuid,
                imageUrl: image.path
            }));

            // Create new images in event_images table
            await EventImages.bulkCreate(imageObjects);
        }

        return successOkWithData(res, "Event Updated Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= deleteEvent ===========================

export async function deleteEvent(req, res) {
    try {
        console.log('==== this is deleteEvent ====')
        const { uuid } = req.query
        if (!uuid) return frontError(res, 'this is required', 'uuid')
        const event = await Event.findOne({ where: { uuid } });
        if (!event) {
            return frontError(res, 'invalid uuid', 'uuid');
        }
        await event.destroy();
        return successOk(res, "Event Deleted Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= getFilteredEvents ===========================

export async function getFilteredEvents(req, res) {
    try {
        console.log('==== this is getFilteredEvents ====')
        console.log('==== this is getFilteredEvents ====')
        console.log('==== this is getFilteredEvents ====')
        const { type, style, date, title } = req.query

        console.log('==== req.query ====\n', req.query)

        let filters = {}

        if (type) {
            const danceType = JSON.parse(type)
            filters.type = {
                [Op.in]: danceType
            }
        }

        if (style) {
            const danceStyle = JSON.parse(style)
            filters.style = {
                [Op.in]: danceStyle
            }
        }

        if (date) { filters.date = date }

        if (title) {
            filters.title = {
                [Op.iLike]: `%${title}%`
            };
        }

        console.log('==== filters ====\n', filters)

        const event = await Event.findAll({
            where: filters,
            include: [{
                model: EventImages,
                as: 'event_images', // Assuming you have defined an association alias 'images'
                attributes: ['imageUrl'] // Optionally, specify which attributes to include from Image model
            }]
        });
        console.log('==== event ====\n', event)
        if (!event || (Array.isArray(event) && event.length === 0)) {
            return successOk(res, 'No events found');
        }

        return successOkWithData(res, "Filtered Events Fetched Successfully", event)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}