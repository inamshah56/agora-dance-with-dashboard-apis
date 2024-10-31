import sendNotification from './sendNotification.js';

const sendTestNotification = async (fcmToken, title, body) => {
    try {
        const imgUrl = 'https://images.rawpixel.com/image_social_portrait/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTExL3JtNzg0LXJlbWl4LWFkai0wMTUtYS5qcGc.jpg'
        const data = {
            nav_screen: "Notifications",
            event_id: "123456",
        }
        const response = await sendNotification(fcmToken, title, body, imgUrl, data);
        return response
    } catch (error) {
        console.log("Error raised while sending notification: \n", error);
        return error
    }
}
export default sendTestNotification;

// sendTestNotification("fxty9NkwRbWf60aJfQMvOM:APA91bFg-WMzmIRCSg7LXSN6riTqw4s3pR9tCsbAwTp1zSQRtr7cMf9TdtwBEW5SdZuV_cx0O_x51Fmj9HBRwai3TVwsH6_Zx8owYznJa7sSa6yL-MHvgknLnayt6cFsrwkDZSw57siT", "This is title", "Body of the notification");