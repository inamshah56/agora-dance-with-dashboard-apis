import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import { FavouriteEvents } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import { Op } from "sequelize";


const eventInTwoDaysNotification_ForTicektHolder = async () => {
    const beforeYesterday = new Date();
    beforeYesterday.setDate(beforeYesterday.getDate() - 2);
    let events = Event.findAll({
        where: { date: beforeYesterday },
        attributes: ["uid", "title", "date", "time"],
        include:
        {
            model: Ticket,
            as: "event_ticket",
            attributes: ["uid"],
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
    for (const event of events) {
        // send notifications with evetn title date and image
    }

}

eventInTwoDaysNotification_ForTicektHolder();

// ========================================

const eventInTwoDaysNotification_ForFavouriteEvents = async () => {
    const beforeYesterday = new Date();
    beforeYesterday.setDate(beforeYesterday.getDate() - 2);
    let events = Event.findAll({
        where: { date: beforeYesterday },
        attributes: ["uid", "title", "date", "time"],

        include:
        {
            model: FavouriteEvents,
            as: "favourite_events",
            attributes: ["uid"],
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
    for (const event of events) {
        // send notifications with evetn title date and image
    }
}

// Add the notificatin method when the event is added in the certain city for the users;
// Send notification when the event is added ask from tayyab