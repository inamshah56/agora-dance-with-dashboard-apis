import dotenv from "dotenv";
dotenv.config();

import cron from 'node-cron';
import { eventInTwoDaysNotification_ForTicektHolder, eventInTwoDaysNotification_ForFavouriteEvents } from './eventNotification.js';

async function executeJobsSequentially() {
    try {
        await eventInTwoDaysNotification_ForTicektHolder();
    } catch (err) {
        console.log("Error raised while executing eventInTwoDaysNotification_ForTicektHolder: ", err);
    }
    try {
        await eventInTwoDaysNotification_ForTicektHolder();
    } catch (err) {
        console.log("Error raised while executing eventInTwoDaysNotification_ForTicektHolder: ", err);
    }

}


// Schedule the function to run at 4 AM every day
cron.schedule('0 4 * * *', () => {
    console.log("Running scheduled job at 4 AM");
    executeJobsSequentially();
});
// executeJobsSequentially()