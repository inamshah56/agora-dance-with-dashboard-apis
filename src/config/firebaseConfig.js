import admin from 'firebase-admin';

const serviceAccount = await import('../../oauth-notify-firebase-adminsdk-1z1l7-ef62a9518a.json', {
    assert: { type: 'json' }
});
admin.initializeApp({
    // un comment the below line during deployment after setting the 
    // GOOGLE_APPLICATION_CREDENTIALS that contains the path of the service account key
    // credential: admin.credential.applicationDefault(),
    credential: admin.credential.cert(serviceAccount.default),
    databaseURL: "https://oauth-notify.firebaseio.com"
});

export default admin.messaging();