import { Event } from "../../models/event/event.model.js";
import { EventImages } from "../../models/event/eventImages.model.js";
import { FavouriteEvents } from "../../models/event/favourites.model.js";
import { created, frontError, catchError, validationError, createdWithData, successOk, successOkWithData } from "../../utils/responses.js";
import { convertToLowercase, validateEmail, validatePassword } from '../../utils/utils.js';
import { bodyReqFields } from "../../utils/requiredFields.js"
import { Sequelize, Op } from "sequelize";

// ========================= getFilteredEvents ===========================

export async function getFilteredEvents(req, res) {
    try {
        const { type, style, date, title, location, city, province } = req.query

        let filters = {}

        if (title) {
            filters.title = {
                [Op.like]: `%${title}%`
            };
        }

        if (location) {
            const locationCordinates = JSON.parse(location)
            const lat = locationCordinates[0]
            const lon = locationCordinates[1]

            // Filter events based on proximity to user-provided location within a 0.05 degree (5000 meters     ) radius
            filters.distance_in_degrees = Sequelize.literal(
                `ST_Distance(location, ST_SetSRID(ST_MakePoint(${lat}, ${lon}), 4326)) < 0.05`,
                true
            );
        }

        if (city) {
            filters.city = city
        }

        if (province) {
            filters.province = province
        }

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

        console.log('==== filters ====\n', filters)

        const event = await Event.findAll({
            where: filters,
            include: [{
                model: EventImages,
                as: 'event_images', // Assuming you have defined an association alias 'images'
                attributes: ['imageUrl'] // Optionally, specify which attributes to include from Image model
            }]
        });
        // console.log('==== event ====\n', event)
        // if (!event || (Array.isArray(event) && event.length === 0)) {
        //     return successOk(res, 'No events found');
        // }

        return successOkWithData(res, "Filtered Events Fetched Successfully", event)
        // return successOk(res, "ytrkl;djkhaldhvdljsvhasdljhvadljhavd")
    } catch (error) {
        console.log(error)
        catchError(res, error);
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

// ========================= addEvent ===========================

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
            "time",
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
            time,
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
            time,
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
                image_url: imagePath
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
            validationError(res, errorMessage, key);
        } else {
            catchError(res, error);
        }
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
                image_url: image.path
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

// =====================================================================
// ========================= Favourite Events ==========================
// =====================================================================

// ========================= getFavouriteEvents ========================

export async function getAllFavourites(req, res) {
    try {

        const userUid = req.user
        console.log("===== userUid ===== : ", userUid)
        const { type, style, date, title, location, city, province } = req.query

        console.log('==== req.query ====\n', req.query)
        let filters = {}

        if (title) {
            filters.title = {
                [Op.like]: `%${title}%`
            };
        }

        if (location) {
            const locationCordinates = JSON.parse(location)
            const lat = locationCordinates[0]
            const lon = locationCordinates[1]

            // Filter events based on proximity to user-provided location within a 0.05 degree (5000 meters     ) radius
            filters.distance_in_degrees = Sequelize.literal(
                `ST_Distance(location, ST_SetSRID(ST_MakePoint(${lat}, ${lon}), 4326)) < 0.05`,
                true
            );
        }

        if (city) {
            filters.city = city
        }

        if (province) {
            filters.province = province
        }

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

        console.log('==== filters ====\n', filters)

        const favouriteEvents = await FavouriteEvents.findAll({
            where: {
                user_uuid: userUid
            },
            include: [
                {
                    model: Event,
                    as: 'event',
                    where: filters
                }
            ]
        });

        // if (!favouriteEvents || (Array.isArray(favouriteEvents) && favouriteEvents.length === 0)) {
        //     return successOk(res, 'No favourite events found');
        // }

        return successOkWithData(res, "All Favourite Events Fetched Successfully", favouriteEvents)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= addToFavourites ===========================

export async function addToFavourites(req, res) {
    try {
        const { eventUuid } = req.query
        const userUid = req.user

        if (!eventUuid) {
            return frontError(res, 'this is required', "eventUuid")
        }

        const addedtoFavourites = await FavouriteEvents.create({ event_uuid: eventUuid, user_uuid: userUid })

        return successOkWithData(res, "Event Added to Favourites", addedtoFavourites)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= removeFromFavourites ======================

export async function removeFromFavourites(req, res) {
    try {
        const { uuid } = req.query

        if (!uuid) {
            return frontError(res, 'this is required', "uuid")
        }

        const favouriteEvent = await FavouriteEvents.findOne({ where: { uuid } });
        if (!favouriteEvent) {
            return frontError(res, 'invalid uuid', 'uuid');
        }
        await favouriteEvent.destroy();
        return successOk(res, "Event Removed from Favourites")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// =====================================================================