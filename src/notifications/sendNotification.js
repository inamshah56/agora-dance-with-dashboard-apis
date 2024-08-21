import fcm from '../config/firebaseConfig.js';

const sendNotification = async (fcmToken, title, body, imgUrl, data, navScreen) => {

    const message = {
        notification: {
            title,
            body
        },
        android: {
            notification: {
                icon: 'stock_ticker_update',
                color: '#7e55c3',
                // to open new screen on notification click
                clickAction: navScreen
            }
        },
        apns: {
            payload: {
                aps: {
                    icon: 'stock_ticker_update',
                    color: '#7e55c3',
                    'mutable-content': 1,
                    // to open new screen on notification click
                    'category': navScreen
                }
            }
        },
        token: fcmToken
    };
    if (imgUrl) {
        message.android.notification.imageUrl = imgUrl;
        message.apns.fcm_options = {}
        message.apns.fcm_options.image = imgUrl;
    }
    if (data) {
        message.data = data;
    }
    console.log("Message: ", message);
    const response = await fcm.send(message);
    return response
}

export default sendNotification;