import { Sequelize, Op } from "sequelize";
import { Ticket } from "../models/ticket.model.js";
import { bodyReqFields } from "../utils/requiredFields.js"
import { convertToLowercase, validateEmail, validatePassword } from '../utils/utils.js';
import { Event, EventImages, FavouriteEvents, Pass, Room, Food } from "../models/event.model.js";
import { created, frontError, catchError, validationError, createdWithData, successOk, successOkWithData, notFound } from "../utils/responses.js";

// =============================================================
//                           Helping function
// =============================================================

function isDateSmallerThanToday(dateToCheck) {
    // Get today's date
    const today = new Date();

    // Set the time to 00:00:00 to only compare the dates
    today.setHours(0, 0, 0, 0);

    // Create a Date object from the dateToCheck (assuming dateToCheck is a string)
    const date = new Date(dateToCheck);

    // Compare the dates
    return date < today;
}

// ==============================================================
//                           Controllers
// ==============================================================

// ========================= getEvent ===========================

export async function getEvent(req, res) {
    try {
        const { uuid } = req.query
        if (!uuid) return frontError(res, 'this is required', 'uuid')

        const event = await Event.findOne({ where: { uuid } });
        if (!event) {
            return frontError(res, 'invalid uuid', 'uuid');
        }

        console.log("event.date  ======== : ", event.date)
        console.log("event.date type ======== : ", typeof event.date)

        const ticketCount = await Ticket.count({
            where: {
                event_uuid: uuid
            }
        });

        const availableTickets = event.total_tickets - ticketCount
        event.dataValues.availableTickets = availableTickets

        return successOkWithData(res, "Event Fetched Successfully", event.dataValues)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= addEvent ===========================

export async function addEvent(req, res) {
    try {
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
        if (isDateSmallerThanToday(date)) return frontError(res, "Event cannot be registered in past", "date");

        const eventCreated = await Event.create(eventData)

        // Process images if available
        if (req.files && req.files["images"]) {
            const imagePaths = req.files["images"].map(file => file.path);

            const imageObjects = imagePaths.map(imagePath => ({
                event_uuid: eventCreated.uuid,
                image_url: imagePath
            }));

            await EventImages.bulkCreate(imageObjects);
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

        if (isDateSmallerThanToday(date)) return frontError(res, "Event cannot be registered in past", "date");


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

        if (date) {
            if (isDateSmallerThanToday(date)) return successOkWithData(res, `Event on date ${date} has already occured.`, [])
            filters.date = date
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filters.date = { [Op.gte]: today }
        }


        const event = await Event.findAll({
            where: filters,
            attributes: {
                exclude: ['total_tickets', 'city', 'province', 'organizer', 'organizer_details', 'createdAt', 'updatedAt']
            },
            include: [{
                model: EventImages,
                as: 'event_images', // Assuming you have defined an association alias 'images'
                attributes: ['image_url'] // Optionally, specify which attributes to include from Image model
            }]
        });

        return successOkWithData(res, "Filtered Events Fetched Successfully", event)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ======================= getEventBookingDetails ======================

export async function getEventBookingDetails(req, res) {
    try {

        const { eventUuid } = req.query
        if (!eventUuid) return validationError(res, "this is required", "eventUuid")

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

        return successOkWithData(res, "Data Fetched", { passesData, roomsData, foodData })
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// =====================================================================
//                               Favourite Events
// =====================================================================

// =========================== getAllFavourites ========================

export async function getAllFavourites(req, res) {
    try {

        const userUid = req.user
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

        return successOkWithData(res, "All Favourite Events Fetched Successfully", favouriteEvents)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= addToFavourites ===========================

export async function addToFavourites(req, res) {
    try {
        const userUid = req.user

        const { eventUuid } = req.query
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
//                                  Passes 
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

        if (event.type !== 'concert') return validationError(res, "Only Concert Pass can be added here", "eventUuid")

        if (passType !== 'full pass') return validationError(res, "Concert can have Full Pass Only", "passType")

        const pass = await Pass.findOne({
            where: {
                event_uuid: eventUuid
            }
        })
        if (pass) {
            return validationError(res, 'Pass Already Exist');
        }

        if (isDateSmallerThanToday(date)) return frontError(res, "Pass for Event cannot be added in past", "date");

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
//                                  Rooms
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
