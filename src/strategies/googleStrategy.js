import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { googleClientId, googleClientSecret, NODE_ENVIRONMENT, port } from '../config/initialConfig.js';
import { domain } from '../config/initialConfig.js';

// explicitly write this host line because during local development the domain contains the ip but we need the locahost.
const host = NODE_ENVIRONMENT === "production" ? domain : `http://localhost:${port}`;

passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: `${host}/api/auth/google/redirect`
},
    function (accessToken, refreshToken, profile, cb) {
        console.log("google access toke =========: ", accessToken);
        return cb(null, profile._json);
    }
));