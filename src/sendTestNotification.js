import { token } from 'morgan';
import fcm from './config/firebaseConfig.js';

const sendNotification = async (fcmToken, title, body) => {
    try {
        const message = {
            notification: {
                title,
                body
            },
            android: {
                notification: {
                    icon: 'stock_ticker_update',
                    color: '#7e55c3',
                    imageUrl: 'https://images.rawpixel.com/image_social_portrait/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTExL3JtNzg0LXJlbWl4LWFkai0wMTUtYS5qcGc.jpg',
                    // to open new screen on notification click
                    clickAction: 'news_intent'
                }
            },
            apns: {
                payload: {
                    aps: {
                        'mutable-content': 1,
                        // to open new screen on notification click
                        'category': 'INVITE_CATEGORY'
                    }
                },
                fcm_options: {
                    image: 'https://images.rawpixel.com/image_social_portrait/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTExL3JtNzg0LXJlbWl4LWFkai0wMTUtYS5qcGc.jpg'
                }
            },
            data: {
                score: '850',
                time: '2:45'
            },
            token: fcmToken
        };
        const response = await fcm.send(message);
        console.log("Notification sends sucessfully", response);
    } catch (error) {
        console.log(error);
    }
}

export default sendNotification;

// sendNotification(""fxty9NkwRbWf60aJfQMvOM:APA91bFg-WMzmIRCSg7LXSN6riTqw4s3pR9tCsbAwTp1zSQRtr7cMf9TdtwBEW5SdZuV_cx0O_x51Fmj9HBRwai3TVwsH6_Zx8owYznJa7sSa6yL-MHvgknLnayt6cFsrwkDZSw57siT"", "This is title", "Body of the notification");