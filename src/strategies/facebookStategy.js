import { Strategy as facebookStategy } from 'passport-facebook';
import passport from 'passport';
import { facebookClientId, facebookClientSecret, NODE_ENVIRONMENT } from '../config/initialConfig.js';
import { domain } from '../config/initialConfig.js';

// explicitly write this host line because during local development the domain contains the ip but we need the locahost.
const host = NODE_ENVIRONMENT === "production" ? domain : `http://localhost:3034`;

passport.use(new facebookStategy({
    clientID: '841001461546423',
    clientSecret: '82ecb990598d59b0f45eb6e04587373d',
    callbackURL: `${host}/api/auth/fb/redirect`,
    profileFields: ['id', 'displayName', 'email']
},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile._json);
    }
));