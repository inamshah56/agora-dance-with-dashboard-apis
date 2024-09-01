import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { googleClientId, googleClientSecret } from '../config/initialConfig.js';

passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "http://localhost:8000/api/auth/google/redirect"
},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile._json);
    }
));