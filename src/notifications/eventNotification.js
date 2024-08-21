import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import { FavouriteEvents } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import { Op } from "sequelize";
import sendNotification from "./sendNotification.js";


const eventInTwoDaysNotification_ForTicektHolder = async () => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    console.log("dayAfterTomorrow: ", dayAfterTomorrow)
    let events = await Event.findAll({
        where: { date: dayAfterTomorrow },
        attributes: ["uuid", "title", "date", "time"],
        include: [
            {
                model: Ticket,
                as: "event_ticket",
                attributes: ["uuid"],
                required: true,
                include: {
                    model: User,
                    as: "user",
                    attributes: ["fcm_token"],
                    where: {
                        fcm_token: {
                            [Op.ne]: null
                        }
                    }

                }
            }
        ]
    })
    events = JSON.parse(JSON.stringify(events))
    for (const event of events) {
        const title = "Event reminder";
        const message = `${event.title} is in two days, on ${event.date} at ${event.time}. Don't forget to attend the event.`;
        const navScreen = "Event_Detail";
        const data = { "event_uuid": event.uuid }

        const eventTickets = event.event_ticket;
        for (const ticket of eventTickets) {
            // send notifications with evetn title date and image
            try {
                const response = await sendNotification(ticket.user.fcm_token, title, message, null, data, navScreen)
                console.log("response: ============================================ ", response)
            }
            catch (err) {
                console.log("Error: ", err)
            }
        }
    }

}



// eventInTwoDaysNotification_ForTicektHolder();

// ========================================

const eventInTwoDaysNotification_ForFavouriteEvents = async () => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    let events = await Event.findAll({
        where: { date: dayAfterTomorrow },
        attributes: ["uuid", "title", "date", "time"],

        include:
        {
            model: FavouriteEvents,
            as: "favourite_events",
            attributes: ["uuid"],
            required: true,
            include: {
                model: User,
                as: "user",
                attributes: ["fcm_token"],
                where: {
                    fcm_token: {
                        [Op.ne]: null
                    }
                }

            }
        }
    })
    events = JSON.parse(JSON.stringify(events))
    console.log("event: \n", events)
    console.log("event_favorite: \n", events[0].favourite_events)
    for (const event of events) {
        const title = "Don’t miss out: book your ticket now";
        const message = `${event.title} is in two days, on ${event.date} at ${event.time}. Book the ticket to secure your seats.`;
        const navScreen = "Event_Detail";
        const data = { "event_uuid": event.uuid }

        const favouriteEvents = event.favourite_events;
        for (const favEvent of favouriteEvents) {
            // send notifications with evetn title date and image
            try {
                const response = await sendNotification(favEvent.user.fcm_token, title, message, null, data, navScreen)
                console.log("response: ============================================ ", response)
            }
            catch (err) {
                console.log("Error: ", err)
            }
        }
    }
}

eventInTwoDaysNotification_ForFavouriteEvents();

// Add the notificatin method when the event is added in the certain city for the users;
// Send notification when the event is added ask from tayyab