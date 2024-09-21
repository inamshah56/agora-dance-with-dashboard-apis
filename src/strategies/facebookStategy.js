import { Strategy as facebookStategy } from 'passport-facebook';
import passport from 'passport';
import { facebookClientId, facebookClientSecret, NODE_ENVIRONMENT } from '../config/initialConfig.js';
import { domain } from '../config/initialConfig.js';

// explicitly write this host line because during local development the domain contains the ip but we need the locahost.
const host = NODE_ENVIRONMENT === "production" ? domain : `http://localhost:3034`;

passport.use(new facebookStategy({
    clientID: facebookClientId,
    clientSecret: facebookClientSecret,
    callbackURL: `${host}/api/auth/fb/redirect`,
    profileFields: ['id', 'displayName', 'email']
},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile._json);
    }
));