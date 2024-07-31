import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID_WEB,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_WEB,
    callbackURL: "http://localhost:8000/api/auth/google/redirect"
},
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile._json);
    }
));