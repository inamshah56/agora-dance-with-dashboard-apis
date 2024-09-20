import admin from 'firebase-admin';
import { firebaseAdminSdk } from './initialConfig.js';
// import serviceAccount from "../../agoradance-d8d90-firebase-adminsdk-tm95v-ff08c3aa1e.json" with { "type": "json" }
const serviceAccount = await import(firebaseAdminSdk, {
    assert: {
        type: "json",
    },
});
admin.initializeApp({
    // un comment the below line during deployment after setting the 
    // GOOGLE_APPLICATION_CREDENTIALS that contains the path of the service account key
    // credential: admin.credential.applicationDefault(),
    credential: admin.credential.cert(serviceAccount.default)
});

export default admin.messaging();